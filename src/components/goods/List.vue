<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 面包屑导航 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">

        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable  @clear="getGoodsList" >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click = "goAdd">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" border>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="价格"></el-table-column>
        <el-table-column prop="goods_weight" label="重量"></el-table-column>
        <el-table-column prop="add_time" label="创建时间"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="goEditPage(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsByid(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5,10, 20, 30]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total = "total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      goodsList: [],
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户失败");
      }
      this.total = res.data.total;
      this.goodsList = res.data.goods;
    },

    // 修改商品信息
    showEditDialog() {},
    // 删除商品信息
    removeGoodsByid(id) {
      console.log(id)
       this.$confirm('确实删除此商品列表嘛?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data:res } = await this.$http.delete(`goods/${id}`)
          if(res.meta.status !== 200){
            return this.$message.error('删除商品失败');
          }
          this.$message.success("删除成功")
          this.getGoodsList()
        }).catch(() => {
          this.$message.info("已取消删除")    
        });
    
    },

   //监听pagesize改变的事件
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getGoodsList();
    },
    // 监听pagenum改变的事件
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getGoodsList();
    },


   //点击添加用户，跳转到添加用户的页面
   goAdd() {
     this.$router.push(`/goods/add`)
   },
   //点击编辑按钮，跳转到修改用户的页面
   goEditPage(id){
     this.$router.push(`/goods/edit?id=`+id)
   }
  },
};
</script>

<style lang='less' scoped>
</style>