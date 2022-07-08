const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const db = require("./index");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

async function findUserById(id) {
  try {
    let queryStr = "SELECT * FROM Users WHERE id = $1";
    let queryValues = [id];

    const { rows } = await db.query(queryStr, queryValues);
    if (rows && rows.length == 1) {
      return extractUserData(rows);
    }
  } catch (e) {
    console.log(e);
  }

  return null;
}

async function findUserByEmail(email) {
  try {
    const { rows } = await db.query("SELECT * FROM Users WHERE email = $1", [email]);
    if(rows.length) return rows[0];
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function insertNewUser(req, res) {
  try {
    const body = req.body;
    const user = await findUserByEmail(body.email);
    if(user) return res.status(405).json({
      type: "SQL Error",
      error: "User already Exist"
    });

    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return res.status(500).json({
          type: "Internal",   
          error: err.message 
        });
      }

      bcrypt.hash(body.password, salt, async (err, hash) => {
        if (err) {
          return res.status(500).json({
            type: "Internal",   
            error: err.message 
          });
        }

        const query = `INSERT INTO users (email, password, firstname, lastname, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;
        const values = [
          body.email, hash, body.firstname, 
          body.lastname, body.phone, body.address
        ];

        const { rows } = await db.query(query, values);
        return res.status(200).json({
          status: true,
          msg: "User Created. Please Login"
        });
      })
    })
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      type: 'SQL Error',
      error: err.message
    });
  }
}

// async function insertNewUser(req, res) {
//   try {
//     const user = await findUserByEmail(req.body.email);
//     console.log(user);
//     if (user) {
//       console.log(user.password);
//       return res
//         .json({ message: "User already exist" });
//     }

//     bcrypt.genSalt(10, function (err, salt) {
//       if (err) {

//         return res.status(400).json({ message: "Internal error" });
//       }

//       bcrypt.hash(req.body.password, salt, function (err, hash) {
//         if (err) {
//           return res.status(400).json({ message: "Internal error" });
//         }


//         db.query(
//           "INSERT INTO users(email, password, mfa) VALUES ($1,$2,false)", [req.body.email, hash]
//         );
//         return res
//           .json({ message: "User created successfully" });
//       })
//     })
//   } catch (e) {
//     console.log(e);
//     return res.status(400).json({ message: "Internal error" });
//   }

//   return null;
// }
async function otp_verifybeforeMfa(req, res) {
  try {

    const user = await findUserByEmail(req.user.email);
    console.log(user);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User doesn't exist" });
    }
    if (authenticator.check(req.body.code, user.secret)) {

      await db.query(
        "UPDATE users SET MFA = true WHERE id = $1",
        [user.id]
      );
      return res
        .status(200)
        .json({ message: "MFA Enabled successfully" });

    }
    else {
      return res
        .status(200)
        .json({ message: "incorrect otp" });
    }

  } catch (e) {
    console.log(e);
    return e;
  }

  return null;
}

async function otp_verifyafterMfa(req, res) {
  try {
    const user = await findUserByEmail(req.body.email);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User doesn't exist" });
    }
    if (authenticator.check(req.body.code, user.secret)) {
      const payload = {
        uid: user.uid,
        email: user.email,
        status: user.status
      };
      jwt.sign(
        payload,
        keys.SECRETORKEY,
        req.body.email ? null : { expiresIn: 31536000 },
        (err, token) => {
          if (err) {
            console.log(err);
            throw error;
          }
          return res
            .json({ token: "Bearer " + token });
        }
      );

    }
    else {
      return res
        .status(404)
        .json({ message: "incorrect otp" });
    }

  } catch (e) {
    console.log(e);
    return e;
  }

  return null;
}

async function signUp_mfa(req, res) {
  try {
    secret = authenticator.generateSecret()
    const user = await findUserByEmail(req.user.email);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User doesn't exist" });
    }
    if (!user.mfa) {
      console.log(user);
      await db.query(
        "UPDATE users SET secret = $1 WHERE id = $2",
        [secret, user.id]
      );

      QRCode.toDataURL(authenticator.keyuri(user.email, '2FA Node App', secret), (err, url) => {
        if (err) {
          throw err
        }

        //req.session.qr = url
        //req.session.email = email
        return res.json({
          qr: url
        });

      })
    }
    else {
      return res
        .json({ message: "MFA already eanabled." });
    }


    //generate qr and put it in session


  }
  catch (e) {
    console.log(e);
    return e;
  }
}

async function login(req, res) {
  try {
    const body = req.body;

    const user = await findUserByEmail(body.email);
    if (!user) return res.status(404).json({
      type: "SQL Error",
      error: "Incorrect Username or Password." 
    });
    
    bcrypt.compare(body.password, user.password, (err, isValid) => {
      if(err) return res.status(500).json({
        type: "Internal",
        error: err.message
      });

      if(!isValid) return res.status(200).json({
        status: false,
        msg: "Invalid Username or Password"
      });

      const jwtPayload = {
        id: user.id, email: user.email, role: user.role
      };

      jwt.sign(jwtPayload, keys.SECRETORKEY, (err, token) => {
        if(err) return res.status(500).json({
          type: "Internal",
          error: err.message
        });

        return res.status(200).json({
          status: true,
          data: {
            token, role: user.role,
            firstname: user.firstname,
            lastname: user.lastname
          }
        })
      })
    });
  } catch (e) {
    console.log(err.message);
    return res.status(500).json({
      type: 'SQL Error',
      error: err.message
    });
  }
}


extractUserData = rows => {
  return new User({
    id: rows[0].id,
    status: rows[0].status,
    email: rows[0].email,
    password: rows[0].password,
    secret: rows[0].secret,
    mfa: rows[0].mfa
  });
};

module.exports = {
  findUserById,
  findUserByEmail,
  insertNewUser,
  login,
  signUp_mfa,
  otp_verifybeforeMfa,
  otp_verifyafterMfa
}


