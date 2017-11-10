module.exports = function(sequelize, DataTypes) {
  return sequelize.define("gameuser", {
      username: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      }
  }, {
  timestamps: false,  // remove audit fields from select
  freezeTableName: true, // stops pluarising the table name
  });
};
