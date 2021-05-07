const Router = require('express')
const User = require('../models/User')
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const router = new Router()

router.post('/registration',
  [
  check('email', 'email is wrong').isEmail(),
  check('password', 'password must be from 3 t 12 symbols').isLength({min: 3, max: 12})
],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({message: 'Email or password wrong.'})
    }

    const {email, password} = req.body
    const hashPassword = await bcrypt.hash(password, 15)
    const candidate = await User.findOne({email})

    if (candidate) {
      return res.status(400).json({message: 'User with this email already registered'})
    }

    const user = new User({email, password: hashPassword})
    await user.save()

    return res.json({message: 'user was created'})

  } catch (e) {
    console.log(e)
    return res.send({message: "Server error" })
  }
})

module.exports = router