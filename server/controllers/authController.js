const User = require("../models/user");
const { hashPassword, comparePassword } = require("../helpers/auth");
const jwt = require("jsonwebtoken");
const test = (req, res) => {
  res.json("Test is working");
};

//Funtion to register the user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //Check if name was entered
    if (!name) {
      return res.json({
        error: "Please enter your name",
      });
    }
    //Cheack if password is good
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    //check email
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: "Email already exists",
      });
    }
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.json(user);
  } catch (error) {
    console.log(error);
  }
};

//Login Endpoint
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check is the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "Invalid Email.Email Not Found",
      });
    }
    //Check if password is correct
    const match = await comparePassword(password, user.password);
    if (match) {
      jwt.sign(
        { email: user.email, id: user._id, name: user.name },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie('token', token).json(user)
        }
      );
    }
    if (!match) {
      return res.json({
        error: "Invalid Password",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getProfile = (req, res) => {
  const {token} =req.cookies
  if(token){
    jwt.verify(token,process.env.JWT_SECRET,{},(err,user)=>{
      if(err) throw err;
      res.json(user)
    })
  }else{
    res.json(null);
  }
}

module.exports = {
  test,
  registerUser,
  loginUser,
  getProfile,
};
