const express = require('express')
const users = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models/User')
users.use(cors())

process.env.SECRET_KEY = 'secret'

users.post('/register', (req, res) => {
  const today = new Date()
  const userData = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    // birthdate:req.body.birthdate,
    created: today,	
  }

  User.findOne({
    where: {
      username: req.body.username
    }
  })
    //TODO bcrypt
    .then(user => {
      if (!user) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          userData.password = hash
          User.create(userData)
            .then(user => {
              res.json({ status: user.username + 'Registered!' })
            })
            .catch(err => {
              res.send('error: ' + err)
            })
        })
      } else {
        res.json({ error: 'User already exists' })
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

users.post('/login', (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
            expiresIn: 1440
          })
          res.send(token)
        }
      } else {
        res.status(400).json({ error: 'User does not exist' })
      }
    })
    .catch(err => {
      res.status(400).json({ error: err })
    })
})

users.get('/getuser',(req,res)=>{
  User.findAll()
  .then(user => {
    res.json(user)
  })
  .catch(err => {
    res.send('error :'+ err)
  })
})
users.delete('/deleteuser/:id',(req,res)=> {
  User.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(() => {
      res.json({ status: 'Deleted!' })
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})
users.put('/updateuser/:id',(req, res)=> {
  User.update(
      { first_name: req.body.first_name,
        last_name:req.body.last_name ,
        email:req.body.email},
      { where: { id: req.params.id } }
    )
      .then(() => {
        res.json({ status: 'Updated!' })
      })
      .error(err => handleError(err))
})
module.exports = users
