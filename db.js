const mysql = require("mysql"); // 引入mysql模块

// 创建连接池
const pool = mysql.createPool({
  host: "localhost", // 服务器地址
  user: "root", // 账号
  password: "text123", // 密码
  database: "demo1", // 数据库名称
});

// 封装sql执行函数
const executeQuery = (sql, values) => {
  // 返回一个Promise对象
  return new Promise((resolve, reject) => {
    // 获取一个数据库连接
    pool.getConnection((err, connection) => {
      // 如果有错误
      if (err) {
        // 拒绝Promise
        reject(err);
        // 返回
        return;
      }
      // 执行查询
      connection.query(sql, values, (queryErr, results) => {
        // 释放连接
        connection.release();

        // 如果有查询错误
        if (queryErr) {
          // 拒绝Promise
          reject(queryErr);
        } else {
          // 否则接受Promise
          resolve(results);
        }
      });
    });
  });
};

// 导出连接池和sql执行函数
module.exports = {
  pool,
  executeQuery,
};
