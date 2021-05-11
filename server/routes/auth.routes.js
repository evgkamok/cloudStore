const Router = require('express')
const User = require('../models/User')
const config = require('config')
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = new Router()
const authMiddleWare = require('../middleware/auth.middleware')

router.post('/registration',
  [
    check('email', 'email is wrong').isEmail(),
    check('password', 'password must be from 3 t 12 symbols').isLength({min: 3, max: 12})
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({message: 'email or password wrong.'})
      }

      const {email, password} = req.body
      const hashPassword = await bcrypt.hash(password, 5)
      const candidate = await User.findOne({email})

      if (candidate) {
        return res.status(400).json({message: 'user with this email already registered'})
      }

      const user = new User({email, password: hashPassword})
      await user.save()

      return res.json({message: 'user was created'})

    } catch (e) {
      console.log(e)
      return res.send({message: "server error"})
    }
  })

router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body
    const user = await User.findOne({email})

    if (!user) {
      return res.status(404).json({message: 'user not found'})
    }

    const isPassValid = bcrypt.compareSync(password, user.password)

    if (!isPassValid) {
      return res.status(404).json({message: 'password is invalid'})
    }

    const token = jwt.sign({id: user.id}, config.get('secretKey'), {expiresIn: '1hr'})
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        usedSpace: user.usedSpace,
        avatar: user.avatar
      }
    })

  } catch (e) {
    console.log(e)
    return res.send({message: "server error"})
  }
})


router.get('/auth', authMiddleWare, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.user.id})
    const token = jwt.sign({id: user.id}, config.get('secretKey'), {expiresIn: '1hr'})
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        usedSpace: user.usedSpace,
        avatar: user.avatar
      }
    })

  } catch (e) {
    console.log(e)
    return res.send({message: "server error"})
  }
})

module.exports = router