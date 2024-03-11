const { pool, executeQuery } = require('./db')
const express = require('express')
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express()
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // 使用 express.json() 中间件来解析 JSON 数据
 
app.get('/getuser', async (req, res) => {
  try {
    const sql = `SELECT * FROM user;`//sql语句 搜索test表所有数据
    const result = await executeQuery(sql)//执行sql语句

    res.send({
      result,
      code: 200,
    })
  } catch (error) {
    console.error('Error executing query:', error)
    res.status(500).send('Internal Server Error')
  }
})

app.post('/register', async (req, res) => {

    console.log('===',req.body.code);
    console.log('===',req.body.username);
    const username = req.body.username
    // const userid = req.body.code

    axios.get('https://api.weixin.qq.com/sns/jscode2session', 
    {params:{
        appid:'wx09c849e5050a4ad0',
        secret:'0122867f51a9f3de3ab2f8564cbae3a7',
        js_code:req.body.code,
        grant_type:'authorization_code'
    }}).then(async (response) => {
        console.log(response.data.openid);
          const userid = response.data.openid
    if (!username ) {
        return res.status(400).json({ message: '用户名不能为空' });
      }
    
      // 在这里可以添加更多的验证逻辑，如检查用户名是否已经存在等
      try {
        const sql = `INSERT INTO user (userid,username) VALUES ( ?, ?)`;
        const result = await executeQuery(sql, [userid, username]);
        
        res.status(201).json({ message: '注册成功', userId: result,userid:userid });
      } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ message: '注册失败' });
      }
    })
    .catch((error) => {
        console.error(error);
    });
    

  });


  app.get('/getaititle', async (req, res) => {
    try {
      const str = req.str

     
  
      res.send({
        aititle,
        code: 200,
      })
    } catch (error) {
      console.error('Error executing query:', error)
      res.status(500).send('Internal Server Error')
    }
  })
 

app.listen('3000', () => {
  console.log(`node服务已启动 端口号是：3000`)
})
