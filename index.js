const { pool, executeQuery } = require("./db");
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // 使用 express.json() 中间件来解析 JSON 数据
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8071");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.get("/getuser", async (req, res) => {
  try {
    const sql = `SELECT * FROM user;`; //sql语句 搜索test表所有数据
    const result = await executeQuery(sql); //执行sql语句

    res.send({
      result,
      code: 200,
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/register", async (req, res) => {
  console.log("===", req.body.code);
  console.log("===", req.body.username);
  const username = req.body.username;
  // const userid = req.body.code
  axios
    .get("https://api.weixin.qq.com/sns/jscode2session", {
      params: {
        appid: "wx09c849e5050a4ad0",
        secret: "0122867f51a9f3de3ab2f8564cbae3a7",
        js_code: req.body.code,
        grant_type: "authorization_code",
      },
    })
    .then(async (response) => {
      console.log(response.data.openid);
      const userid = response.data.openid;
      if (!username) {
        return res.status(400).json({ message: "用户名不能为空" });
      }

      // 在这里可以添加更多的验证逻辑，如检查用户名是否已经存在等
      try {
        const sql = `INSERT INTO user (userid,username) VALUES ( ?, ?)`;
        const result = await executeQuery(sql, [userid, username]);
        let isadmin = false;
        if (userid === "o_EnM6SJeA7DUdVkuKQZ5NmUNw-s") {
          isadmin = true;
        }

        res
          .status(201)
          .json({
            message: "注册成功",
            userId: result,
            userid: userid,
            isadmin: isadmin,
          });
      } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ message: "注册失败" });
      }
    })
    .catch((error) => {
      console.error(error);
    });
});

app.post("/addgoods", async (req, res) => {
  // console.log('===',req.body);
  const shopid = req.body.userid;
  const goodsname = req.body.goodsname;
  const username = req.body.shopname;
  const shopprice = req.body.goodsprice;
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  const address = req.body.address;
  const goodsclass = req.body.goodsclass;
  const title = req.body.goodstitle;
  const img = req.body.goods_img;
  // 将一个字符串数组转换为字符串，中间用逗号隔开
  const imglist = img.join(",");
  console.log(imglist);

  // const userid = req.body.code
  // return

  // 在这里可以添加更多的验证逻辑，如检查用户名是否已经存在等
  try {
    const sql = `INSERT INTO goods (username,shopprice,longitude,latitude,address,class,title,img,userid,goodsname) VALUES ( ?, ?,?,?,?,?,?,?,?,?)`;
    const result = await executeQuery(sql, [
      username,
      shopprice,
      longitude,
      latitude,
      address,
      goodsclass,
      title,
      imglist,
      shopid,
      goodsname,
    ]);

    res.status(201).json({ message: "添加成功", data: result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ message: "注册失败" });
  }
});

app.get("/getgoods", async (req, res) => {
  try {
    const sql = `SELECT * FROM goods;`; //sql语句 搜索test表所有数据
    const result = await executeQuery(sql); //执行sql语句
    const data = result.map((row) => ({ ...row, img: row.img.split(",") }));

    res.send({
      data: data,
      code: 200,
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/getovergoods", async (req, res) => {
  try {
    const sql = "SELECT * FROM `over`"; //sql语句 搜索test表所有数据
    const result = await executeQuery(sql); //执行sql语句
    const data = result.map((row) => ({ ...row, img: row.img.split(",") }));

    res.send({
      data: data,
      code: 200,
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/addover", async (req, res) => {
  console.log(req.body);
  const shopid = req.body.shopid;
  const overtime = req.body.overtime;
  const buyid = req.body.buyid;
  // const userid = req.body.code
  // return;

  try {
    // 通过goodsid获取goods表中对应的一列数据
    const sql1 = `SELECT * FROM goods WHERE shopid = ?`;
    const result = await executeQuery(sql1, [shopid]);

    const sql2 =
      "INSERT INTO `over` (overtime, buyid, userid, img, shopid, shopprice, address, class, title, longitude, latitude, username, goodsname) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const result2 = await executeQuery(sql2, [
      overtime,
      buyid,
      result[0].userid,
      result[0].img,
      result[0].shopid,
      result[0].shopprice,
      result[0].address,
      result[0].class,
      result[0].title,
      result[0].longitude,
      result[0].latitude,
      result[0].username,
      result[0].goodsname,
    ]);

    const sql = "DELETE FROM goods WHERE shopid = ?";
    const result3 = await executeQuery(sql, [shopid]);

    res.status(200).json({ message: "交易成功", data: result2 });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ message: "获取商品信息失败" });
  }
});

app.post("/getover", async (req, res) => {
  console.log(req.body);
  const userid = req.body.userid;
  // const userid = req.body.code
  // return;

  try {
    // 通过userid
    const sql1 = "SELECT * FROM `over` WHERE userid = ?";
    const result1 = await executeQuery(sql1, [userid]);
    const data1 = result1.map((row) => ({ ...row, img: row.img.split(",") }));

    const sql2 = "SELECT * FROM `over` WHERE buyid = ?";
    const result2 = await executeQuery(sql1, [userid]);
    const data2 = result2.map((row) => ({ ...row, img: row.img.split(",") }));

    res
      .status(200)
      .json({ message: "交易成功", buygoods: data1, maingoods: data2 });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ message: "获取商品信息失败" });
  }
});

app.post("/deletegoods", async (req, res) => {
  const shopid = req.body.shopid;
  try {
    // 执行删除操作的SQL语句
    const sql = "DELETE FROM `goods` WHERE shopid = ?";
    // 执行SQL语句，并传入商品ID作为参数
    const result = await executeQuery(sql, [shopid]);
    // 检查受影响的行数，如果大于0则表示删除成功，否则表示删除失败
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "商品删除成功" });
    } else {
      res.status(404).json({ message: "未找到对应的商品" });
    }
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ message: "删除商品失败" });
  }
});

app.post("/deleteovergoods", async (req, res) => {
  const shopid = req.body.shopid;
  try {
    // 执行删除操作的SQL语句
    const sql = "DELETE FROM `over` WHERE shopid = ?";
    // 执行SQL语句，并传入商品ID作为参数
    const result = await executeQuery(sql, [shopid]);
    // 检查受影响的行数，如果大于0则表示删除成功，否则表示删除失败
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "商品删除成功" });
    } else {
      res.status(404).json({ message: "未找到对应的商品" });
    }
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ message: "删除商品失败" });
  }
});

app.listen("3000", () => {
  console.log(`node服务已启动 端口号是：3000`);
});
