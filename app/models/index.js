if (!global.hasOwnProperty('db')) {
  var Sequelize = require('sequelize'),
      sequelize = null;

  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL);
    console.log('Got to the DATABASE_URL');
    console.log('Made a sequelize');
  } else {
    console.log('Could not get to the DATABASE_URL');
  }

  sequelize
    .authenticate()
    .then(function(err) {
      console.log('Connection has been established successfully.');
    })
    .catch(function (err) {
      console.log('Unable to connect to the database:', err);
    });

  global.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    gameuser:sequelize.import(__dirname + '/gameuser')
    // add your other models here
  };

  console.log('set global db');
}

module.exports = global.db;
