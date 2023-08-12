const bcrypt = require("bcryptjs");
const crypto = require("crypto");

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        // Model attributes are defined here
        name: {
            type: Sequelize.STRING,
            required: true
        },
        email: {
            type: Sequelize.STRING,
            required: [true, 'Please provide your email'],
            unique: true,
        },
        password: {
            type: Sequelize.STRING,
            required: true
        },
        created_at: Sequelize.DATE,
        passwordResetToken: Sequelize.STRING,
        passwordResetExpires: Sequelize.DATE
    }, {
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 12);
                    user.passwordConfirm = undefined;
                }
            },
            beforeUpdate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 12);
                    user.passwordConfirm = undefined;
                }
            }
        },
        instanceMethods: {
            createPasswordResetToken: () => {
                let resetToken = crypto.randomBytes(32).toString('hex');
                this.passwordResetToken = resetToken;
                resetToken = resetToken + "|" + this._id;
                this.created_at = Date.now()
                this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
                let bufferObj = Buffer.from(resetToken, "utf8");
                resetToken = bufferObj.toString("base64");
                return resetToken;
            }
        }
    });
    return User;
};

