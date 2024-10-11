const jwt = require('jsonwebtoken');
const Employees = require('../modules/Employees');
const {WHouse} = require('../modules/warehouse');
const { ObjectId } = require("mongodb");
var requestIp = require('request-ip');
var geolocation = require('geolocation')

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'BigBern', (err, decodedToken) => {
      if (err) {
        res.redirect('/api/v1/SignIn');
      } else {
        next();
      }
    });
  } else {
    res.redirect('/api/v1/SignIn');
  }
};

const QrcodeInvoicer = async (req, res, next) => {
  const token = req.cookies.jwt;
  
  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'BigBern', async (err, decodedToken) => {
      const scanner = await Employees.findById(decodedToken.id)
      const warehouse = await WHouse.findById(req.params.WHID)
      if (scanner._id.toString() === warehouse.StoreKeeper._id.toString()) {
        next();
      } else {
        res.redirect('/api/v1/SignIn');
      }
    });
  } else {
    res.redirect('/api/v1/SignIn');
  }

};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'BigBern', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        if(res.locals.user === null) {
          res.redirect('/api/v1/SignIn');
        }
        next();
      } else {
        let user = await Employees.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
     
    });
  } else {
    res.locals.user = null;
    next();
  }
};

// log user out if status is inactivated
const checkUserStatus = (req, res, next) => {
  if(res.locals.user && res.locals.user.status === 'suspended') {
    res.clearCookie('jwt');
    res.locals.user = null;
    res.redirect('/api/v1/SignIn');
  } else {
    next();
  }
};


const useIp = async (req, res, next) => {
  // geolocation.getCurrentPosition(function (err, position) {
  //   if (err) throw err
  //   console.log(position)
  // })
  next();
};

module.exports = {requireAuth ,checkUser,QrcodeInvoicer,checkUserStatus,useIp}