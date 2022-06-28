

var crypto = require('crypto');
var request = require('request');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const db = require("./index");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
async function findUserById(id) {
  console.log(id);
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
    console.log('jjjjjjjjj');
    const { rows } = await db.query(
      "SELECT * FROM Users WHERE LOWER(email) = LOWER($1)",
      [email]
    );
    console.log('hey');
    if (rows && rows.length == 1) {
      return extractUserData(rows);
    }
  } catch (e) {
    console.log(e);
  }

  return null;
}


async function insertNewUser(req, res) {
  try {
    const user = await findUserByEmail(req.body.email);
    console.log(user);
    if (user) {
      console.log(user.password);
      return res
        .json({ message: "User already exist" });
    }



    bcrypt.genSalt(10, function (err, salt) {
      if (err) {

        return res.status(400).json({ message: "Internal error" });
      }

      bcrypt.hash(req.body.password, salt, function (err, hash) {
        if (err) {
          return res.status(400).json({ message: "Internal error" });
        }


        db.query(
          "INSERT INTO users(email, password, mfa) VALUES ($1,$2,false)", [req.body.email, hash]
        );
        return res
          .json({ message: "User created successfully" });
      })
    })
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Internal error" });
  }

  return null;
}
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
    const user = await findUserByEmail(req.body.email);
    console.log(user);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Incorrect username or password." });
    }

    bcrypt
      .compare(req.body.password, user.password)
      .then(isMatch => {
        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "Incorrect username or password." });
        }

        if (user.mfa) {
          return res
            .status(200)
            .json({
              message: "Please Provide otp for login.",
              "email": user.email,
              status: true
            });
        }
        else {

          const payload = {
            id: user.id,
            email: user.email,

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
              console.log(token);

              return res
                .json({ token: "Bearer " + token, status: false });
            }
          )
        }
      })
      .catch(error => {
        console.log(error);
        res.status(400).json({ message: "Internal error" });
      });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: "Internal Error" });
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


