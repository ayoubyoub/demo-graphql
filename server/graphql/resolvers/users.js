const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  validateRegisterInput,
  validateLoginInput,
  validateUpdateUserInput,
} = require("../../utils/validators");
const User = require("../../models/User");
const checkAuth = require("../../utils/check-auth");
const { transport, htmlEmail } = require("../../helpers/mail");
const { UserInputError } = require("apollo-server");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.SECRET_KEY,
    { expiresIn: process.env.TIMEOUT_EXPIRED_ST }
  );
}

module.exports = {
  Query: {
    async getUser(_, args, context) {
      try {
        const check = await checkAuth(context);
        if (!check) throw new Error("Token doesn't exist or has expired");
        const username = check.username;
        const user = await User.findOne({
          username,
        });
        return user;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);
      if (!valid) {
        throw new UserInputError("Wrong credentials", { errors });
      }
      const user = await User.findOne({ username });
      if (!user) {
        // look at validators.js for errors comparison
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong credentials";
        throw new UserInputError("Wrong credentials", { errors });
      }
      // if user is found and password matches db password then we issue them a token.
      const token = generateToken(user);
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // Make sure user doesn't already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username is taken", {
          // this will be used later to display errors on front end form
          errors: {
            username: "This username is taken",
          },
        });
      }
      // Create a email verification token
      let emailVerifiedToken = Math.random().toString(36).substring(2, 15);
      emailVerifiedToken += Math.random().toString(36).substring(2, 15);
      // Send an email (in the background) containing the verification token
      try {
        transport.sendMail({
          from: process.env.MAIL_FROM,
          to: email,
          subject: "Please verify your email address",
          html: htmlEmail(`This is your verification token:
    \n\n
    ${emailVerifiedToken}`),
        });
      } catch (err) {
        console.log(err);
      }
      // Hash the password before it's stored in our DB create an auth token
      password = await bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        username,
        password,
        emailVerified: false,
        emailVerifiedToken,
        createdAt: new Date().toISOString(),
      });
      const res = await newUser.save();
      const token = generateToken(res);
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    async updateUser(_, { email, password }, context) {
      const username = await checkAuth(context).username;
      // Validate user data
      const { valid, errors } = validateUpdateUserInput(email, password);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // Hash the password before it's stored in our DB create an auth token
      password = await bcrypt.hash(password, 12);
      // Update user
      const user = await User.findOneAndUpdate(
        { username },
        {
          email,
          password,
          updatedAt: new Date().toISOString(),
        },
        { new: true }
      );
      return user;
    },
    async forgotPassword(_, { email }) {
      // Ensure user exists
      const user = await User.findOne({ email });
      if (!user)
        throw new Error("You're not authorized to reset this password");
      // Create a 'reset token' + expiry time and add to the DB
      let resetToken = Math.random().toString(36).substring(2, 15);
      resetToken += Math.random().toString(36).substring(2, 15);
      const resetTokenExpires = Date.now() + process.env.TIMEOUT_EXPIRED;
      await User.findOneAndUpdate(
        { username: user.username },
        {
          resetToken,
          resetTokenExpires,
        },
        { new: true }
      );
      // Send an email (in the background) containing the token
      try {
        transport.sendMail({
          from: process.env.MAIL_FROM,
          to: user.email,
          subject: "Your Password Reset Token",
          html: htmlEmail(`This is your password reset token!
          \n\n
          ${resetToken}`),
        });
      } catch (err) {
        console.log(err);
      }
      // Return the a success
      return { message: "Email sent" };
    },
    async resetPassword(_, { resetToken, password }) {
      // Ensure user exists
      const user = await User.findOne({
        resetToken,
        resetTokenExpires: {
          $gte: Date.now() - process.env.TIMEOUT_EXPIRED,
        },
      });
      if (!user) throw new Error("Token doesn't exist or has expired");
      const username = user.username;
      password = await bcrypt.hash(password, 12);
      // Update user
      const res = await User.findOneAndUpdate(
        { username },
        {
          password,
          resetToken: null,
          resetTokenExpires: null,
        },
        { new: true }
      );
      const token = generateToken(res);
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    async verifyEmail(_, { emailVerifiedToken }) {
      // Ensure user exists
      const user = await User.findOne({ emailVerifiedToken });
      if (!user) throw new Error("Token doesn't exist");
      // User already verified, show a suitable message
      if (user && user.emailVerified)
        throw new Error("This email has already been verified");
      // Email verified user
      const res = await User.findOneAndUpdate(
        { emailVerifiedToken },
        {
          emailVerified: true,
        },
        { new: true }
      );
      return {
        ...res._doc,
        id: res._id,
      };
    },
  },
};
