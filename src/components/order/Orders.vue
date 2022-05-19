<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 面包屑导航 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索和添加 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 展示订单数据列表 -->
      <el-table :data="orderList" border stripe @expand-change="getOrderDetail">
        <!-- 明细展开列 -->
        <el-table-column label="明细" type="expand">
          <template slot-scope="scope">
            <el-table :data="scope.row.detail" border stripe>
              <el-table-column label="封面" width="100px" header-align="center" align="center">
                <template slot-scope="sc">
                  <!-- 实现图片覆盖放大效果 -->
                  <el-popover placement="top-start" width="100" trigger="hover">
                    <img :src="sc.row.url" style="width:150px;height:150px">
                    <img :src="sc.row.url" style="width:50px;height:50px" slot="reference">
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column label="商品名称" prop="goods_name"></el-table-column>
              <el-table-column label="商品数量" prop="goods_number" width="100px"></el-table-column>
              <el-table-column label="商品重量" prop="goods_weight" width="100px"></el-table-column>
              <el-table-column label="商品价格(元)" prop="goods_price" width="100px"></el-table-column>
              <el-table-column label="总价(元)" prop="goods_total_price" width="100px"></el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"> </el-table-column>
        <el-table-column label="订单价格(元)" prop="order_price"> </el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" size="mini" effect="dark" v-if="scope.row.pay_status === '1'">
              已付款
            </el-tag>
            <el-tag type="danger" size="mini" effect="dark" v-else>
              未付款
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"> </el-table-column>
        <el-table-column label="下单时间" prop="create_time"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="修改收货地址" placement="top" :enterable="false">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="showAddressDialog(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="查看物流信息" placement="top" :enterable="false">
              <el-button type="warning" size="mini" icon="el-icon-location" @click="showProgressDialog"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 修改收货地址对话框 -->
    <el-dialog title="提示" :visible.sync="orderDialogVisible" width="30%" @close="orderDialogClose">
      <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <!-- 省市区/县的级联选择器 -->
          <el-cascader v-model="addressForm.address1" :options="citydata" :props="{ expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="orderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddress">确 定</el-button>
      </span>
    </el-dialog>
    <!--查看物流进度对话框 -->
    <!-- @close="ProgressDialogClose" -->
    <el-dialog title="物流" :visible.sync="ProgressDialogVisible" width="30%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
//导入城市，区域分类数据
import citydata from "./citydata";
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      //获取订单列表
      orderList: [],
      //获取用户信息总条数
      total: 0,

      //修改地址对话框弹出开关
      orderDialogVisible: false,

      //导入城市，区域分类数据
      citydata,

      addressForm: {
        address1: [],
        address2: "",
      },
      addressRules: {
        address1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
        ],
      },
      // 订单列表的每一行对应的id
      order_id: null,

      //默认状态，查看物流进度对话框不显示
      ProgressDialogVisible: false,

      //从后台获取回来的物流信息
      progressInfo: [],
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    //获取订单列表数据
    async getOrderList() {
      const { data: res } = await this.$http.get(`orders`, {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败");
      }
      res.data.goods.forEach((item) => {
        item.create_time = this.$utils.formatToTime(item.create_time);

        // 为订单对象添加detail
        item.detail = [];
      });
      this.orderList = res.data.goods;
      this.total = res.data.total;
    },
    //监听pagesize改变的事件
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getOrderList();
    },
    // 监听pagenum改变的事件
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getOrderList();
    },

    //获取订单明细
    async getOrderDetail(row) {
      const { data: res } = await this.$http.get(`orders/${row.order_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单明细失败");
      }
      row.detail = res.data.goods;

      //获取订单下的商品详情
      row.detail.forEach(async (item) => {
        const { data: res } = await this.$http.get(`goods/${item.goods_id}`);
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品详情失败");
        }
        this.$set(item, "goods_name", res.data.goods_name); //为商品对象，响应式地添加属性
        this.$set(item, "goods_weight", res.data.goods_weight);
        this.$set(item, "url", res.data.pics[0].pics_big_url);
      });
    },
    //监听对话框的关闭 如果对话框关闭，清空遗留在表单上的数据
    orderDialogClose() {
      this.$refs.addressFormRef.resetFields();
    },
    // 展示修改收货地址对话框，拿到orderList里的order_id
    showAddressDialog(row) {
      this.order_id = row.order_id;
      this.orderDialogVisible = true;
    },

    //修改地址对话框
    async editAddress() {
      // 提交数据到后台之前，先校验是否通过
      this.$refs.addressFormRef.validate((valid) => {
        if (!valid) {
          return;
        }
      });
      const { data: res } = await this.$http.put(
        `orders/${this.order_id}/address`,
        {
          consignee_addr:
            this.addressForm.address1.join(",") +
            "," +
            this.addressForm.address2,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("无法提交修改后的地址");
      }
      this.$message.success("提交成功");
      this.getOrderList();
      this.orderDialogVisible = false;
    },

    // 显示物流进度对话框
    async showProgressDialog() {
      const { data: res } = await this.$http.get(`/kuaidi/815294206237577`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取物流信息失败");
      }
      // console.log(res.data)
      this.progressInfo = res.data;
      this.ProgressDialogVisible = true;
    },
  },
};
</script>
<style lang='less' scoped>
.el-cascader {
  width: 100%;
}
</style>