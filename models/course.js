'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // One User can own many courses, but a Course may only belong to one User
      Course.belongsTo(models.User, {
        foreignKey: {
          // the 'userId' field will link to the User's primary key
          name: 'userId',
          type: DataTypes.INTEGER,
          // Require this field in a new Course instance
          allowNull: false,
          validate: {
            // Only accept this Course if the proposed User owner exists
            async userExists(value) {
              const user = await models.User.findOne( {
                where: {
                  id: value
                }
              })
              if (!user) {
                throw new Error(`User with id ${value} does not exist`);
              }
            }
          }
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      });
    }
  };
  Course.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Course title cannot be empty"
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Course description cannot be empty"
        }
      }
    },
    // These two fields are not necessary
    estimatedTime: {
      type: DataTypes.STRING,
    },
    materialsNeeded: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};