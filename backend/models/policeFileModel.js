const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PoliceFile = sequelize.define(
  "police_files",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    police_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    badge_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    station: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rank: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING(20),
    },
    email: {
      type: DataTypes.STRING(100),
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended", "retired"),
      defaultValue: "active",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    underscored: true,
    tableName: "police_files",
  }
);

module.exports = PoliceFile;