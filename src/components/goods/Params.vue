<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 面包屑导航 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false"></el-alert>
      <!-- 级联选择器 -->
    <el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderProps" @change="handleChange" clearable></el-cascader>
      <!-- 标签页的显示 -->
    <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="动态参数" name="first">
      <el-button type="primary" size = "mini" :disabled = true>添加参数</el-button>
      <el-table>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label = "参数名称"></el-table-column>
        <el-table-column label="操作"></el-table-column>
      </el-table>
    </el-tab-pane>
    <el-tab-pane label="静态属性" name="second">222</el-tab-pane>
    </el-tabs>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //分类列表
      cateList: [],
      //   级联选择器的配置对象
      cascaderProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: true, //可以选择任意的选项，
      },
       // 级联选择器选中的id数组
      selectedKeys: [],

      //默认显示标签页第一个
      activeName:'first'

    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类列表失败");
      }
      this.cateList = res.data;
      console.log(this.cateList)
    },
  },
   // 级联选择器的改变事件
    handleChange() {
      // 判断是否选择了父级分类
    //   console.log(this.selectedKeys);
    //   if (this.selectedKeys.length > 0) {
    //     this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]; //取出数组中的最后一个数值
    //     this.addForm.cat_level = this.selectedKeys.length;
    //   } else {
    //     this.cat_pid = 0;
    //     this.cat_level = 0;
    //   }

    },

    //获取分类参数的数据
    getParamsData(){
      // 判断是否选中三级分类,清空返回
      if(this.selectedKeys.length !==3){
        this.selectedKeys = []
        return
      }
      
    }
};
</script>

<style lang='less' scoped>
</style>