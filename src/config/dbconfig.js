module.exports = {
  user: process.env.NODE_ORACLEDB_USER || "hr",
  password: process.env.NODE_ORACLEDB_PASSWORD,
  connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || "localhost/orclpdb1",
  externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false,
  };
