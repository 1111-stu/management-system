<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 面包屑导航 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>欢迎页</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row :gutter="10">
      <el-col :span="6">
        <div class="statistics" style="background:#409eff">
          <div class="title">
            <p>用户统计</p>
            <el-tag type="success" size="mini">实时</el-tag>
          </div>
          <div class="num">{{userTotal}}</div>
          <div class="tip">当前总用户量</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistics" style="background:#E6A23C">
          <div class="title">
            <p>商品统计</p>
            <el-tag type="info" size="mini">实时</el-tag>
          </div>
          <div class="num">{{goodsTotal}}</div>
          <div class="tip">当前总商品数量</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistics" style="background:#63C23A">
          <div class="title">
            <p>订单统计</p>
            <el-tag type="warning" size="mini">实时</el-tag>
          </div>
          <div class="num">{{orderTotal}}</div>
          <div class="tip">当前总订单数量</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistics" style="background:#909399">
          <div class="title">
            <p>销售统计</p>
            <el-tag type="primary" size="mini">实时</el-tag>
          </div>
          <div class="num">{{saleroom}}</div>
          <div class="tip">当前总销售额(元)</div>
        </div>
      </el-col>
    </el-row>
    <div class="echarts-container">
      <el-card id="chart1"></el-card>
      <el-card id="chart2"></el-card>
    </div>
  </div>
</template>
<script>
import * as echarts from "echarts";
export default {
  data() {
    return {
      userTotal: 0,
      goodsTotal: 0,
      orderTotal: 0,
      saleroom: 0,
      //订单列表
      orderList: [],
    };
  },
  created() {
    this.getUserList();
    this.getGoodsList();
    this.getOrderList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get(`users`, {
        params: {
          pagenum: 1,
          pagesize: 1,
        },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败");
      }
      this.userTotal = res.data.total;
    },

    async getGoodsList() {
      const { data: res } = await this.$http.get(`goods`, {
        params: {
          pagenum: 1,
          pagesize: 1,
        },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      this.goodsTotal = res.data.total;
    },

    async getOrderList() {
      const { data: res } = await this.$http.get(`orders`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败");
      }
      this.orderTotal = res.data.total;

      // 计算总销售额
      this.orderList = res.data.goods;
      res.data.goods.forEach((item) => {
        if (item.pay_status === "1") {
          this.saleroom += item.order_price;
        }
      });

      // 展示图表
      this.initChart1();
      this.initChart2();
    },

    initChart1() {
      //创建echarts实例
      var chart1 = echarts.init(document.getElementById("chart1"));
      // 订单趋势
      var option = {
        title: {
          text: "订单趋势",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
          },
        },
        xAxis: {
          type: "category",
          data: [],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "line",
            smooth: true,
            data: [],
          },
        ],
      };
      //处理数据 给时间排序，升序排序
      this.orderList.sort(function (a, b) {
        return a.create_time - b.create_time;
      });
      let data = [];
      //获取日期和订单总额。
      this.orderList.forEach((item) => {
        //状态码为1表示已支付
        if (item.pay_status === "1") {
          let key = this.$utils.formatToDate(item.create_time);
          if (!data[key]) {
            data[key] = item.order_price;
          } else {
            data[key] += item.order_price;
          }
        }
      });

      //将数据添加到option中
      for (var key in data) {
        option.xAxis.data.push(key);
        option.series[0].data.push(data[key]);
      }

      chart1.setOption(option);
    },

    initChart2() {
      // 订单状态
      //创建echarts实例
      var chart2 = echarts.init(document.getElementById("chart2"));
      var option = {
        title: {
          text: "订单状态",
        },
        tooltip: {
          trigger: "item",
          formatter: "{b} : {c} ({d}%)",
        },
        legend: {
          orient: "vertical",
          left: "right",
          data: [],
        },
        series: [
          {
            name: "订单状态",
            type: "pie",
            radius: "55%",
            center: ["50%", "60%"],
            data:[],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
      var peichartData = [
        {
          name: "已付款",
          value: 0,
        },
        {
          name: "未付款",
          value: 0,
        },
      ];
      this.orderList.forEach((item) => {
        if (item.order_pay === "1") {
          peichartData[0].value++;
        } else {
          peichartData[1].value++;
        }
      });
      for (let item of peichartData) {
        option.legend.data.push(item.name)
        option.series[0].data.push(item);
      }
      chart2.setOption(option);
    },
  },
};
</script>

<style lang='less' scoped>
.el-row {
  padding: 0 9px;
  .statistics {
    color: white;
    height: 100px;
    border-radius: 4px;
    padding: 0 8px;
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      p {
        font-size: 13px;
        font-weight: bold;
      }
    }
    .num {
      font-size: 20px;
      font-weight: bold;
      text-align: center;
    }
  }
}
.echarts-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  .el-card {
    height: 400px;
    width: 50%;
    margin: 0 8px;
    padding: 20px;
  }
}
</style>