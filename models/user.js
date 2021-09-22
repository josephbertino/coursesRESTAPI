'use strict';
const bcrypt = require('bcrypt');
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // One User can be the owner of many courses
      User.hasMany(models.Course, 
      { 
        foreignKey: {
          // the Course attribute 'userId' will point to User's primary key ('id')
          name: 'userId',
          type: DataTypes.INTEGER,
          allowNull: false
      }});
    }
  };
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "User first name cannot be empty"
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "User last name cannot be empty"
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "User email cannot be empty"
        },
        isEmail: {
          msg: "User email not properly formatted"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password cannot be empty"
        },
        len: {
          args: [12,20],
          msg: "Password must be between 12 and 20 characters"
        }
      },
    } 
  }, {
    hooks: {
      // Only hash the password before saving, and after validating the length of the plaintext
      beforeCreate: (user) => {
        user.password = bcrypt.hashSync(user.password, 10);
      },
      beforeUpdate: (user) => {
        user.password = bcrypt.hashSync(user.password, 10);
      }
    },
    sequelize,
    modelName: 'User',
  });
  return User;
};