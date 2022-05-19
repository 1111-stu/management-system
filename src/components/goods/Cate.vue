<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 面包屑导航 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button size="mini" type="primary" @click="showAddDialog">添加分类</el-button>
          <!-- tree-table表格 -->
          <tree-table class="tree-table" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index border>
            <template slot="isOK" slot-scope="scope">
              <!-- cat_deleted=true时，表示无效  -->
              <i class="el-icon-error" style="color:red" v-if="scope.row.cat_deleted"></i>
              <i class="el-icon-success" style="color:green" v-else></i>
            </template>
            <template slot="order" slot-scope="scope">
              <el-tag size="mini" v-if="scope.row.cat_level==0">一级</el-tag>
              <el-tag size="mini" type="warning" v-else-if="scope.row.cat_level==1">二级</el-tag>
              <el-tag size="mini" type="success" v-else>三级</el-tag>
            </template>
            <template slot="operate" slot-scope="scope">
              <el-button type="primary" size="mini" class="el-icon-edit" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
              <el-button type="danger" size="mini" class="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除</el-button>
            </template>
          </tree-table>
        </el-col>
      </el-row>
      <!--分页-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader v-model="selectedKeys" :options="ParentCateList" :props="cascaderProps" @change="handleChange" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询分类列表的参数对象
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },

      //分类列表
      cateList: [],
      // 商品分类信息总条数
      total: 0,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //   prop:"cat_deleted"
          // 把当前列设置为模板列
          type: "template",
          // 设置模板绑定isOk
          template: "isOK",
        },
        {
          label: "排序",
          //   prop:"cat_deleted"
          // 把当前列设置为模板列
          type: "template",
          // 设置模板绑定isOk
          template: "order",
        },
        {
          label: "操作",
          //   prop:"cat_deleted"
          // 把当前列设置为模板列
          type: "template",
          // 设置模板绑定isOk
          template: "operate",
        },
      ],
      // 添加分类对话框开关
      addDialogVisible: false,

      //   添加分类对话框表单对象
      addForm: {
        cat_name: "", //分类名称
        cat_pid: 0, //父级分类的id,默认为0,不能为空，如果要添加一级分类，则父分类Id应该设置为0
        cat_level: 0, //不能为空， 0 表示一级分类； 1 表示二级分类； 2 表示三级分类
      },
      //   添加分类对话框表单校验规则
      addFormRules: {
        cat_name: [{ required: true, message: "请分类名称", trigger: "blur" }],
      },
      //   父级数据分类列表
      ParentCateList: [],
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

      //编辑分类信息
      editForm: {},
      //编辑表单校验规则
      editFormRules: {
        cat_name: [{ required: true, message: "请分类名称", trigger: "blur" }],
      },
      editDialogVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`, {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
      //   console.log(this.cateList);
      //   console.log(this.total);
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getCateList();
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getCateList();
    },

    //获取父级分类
    async getParentCateList() {
      const { data: res } = await this.$http.get(`categories`, {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级列表失败");
      }
      this.ParentCateList = res.data;
      //   console.log(res.data);
    },
    // 点击添加分类按钮显示对话框
    showAddDialog() {
      this.getParentCateList();
      this.addDialogVisible = true;
    },
    // 级联选择器的改变事件
    handleChange() {
      // 判断是否选择了父级分类
      console.log(this.selectedKeys);
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]; //取出数组中的最后一个数值
        this.addForm.cat_level = this.selectedKeys.length;
      } else {
        this.cat_pid = 0;
        this.cat_level = 0;
      }
    },
    //添加分类
    addCate() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post(`categories`, this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }
        this.addDialogVisible = false;
        this.getCateList();
        this.$message.success("添加分类成功");
      });
    },
    // 监听添加分类对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
      this.selectedKeys = [];
      this.cat_pid = 0;
      this.cat_level = 0;
    },
    //监听编辑分类对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //点击编辑按钮，显示编辑分类名称对话框
    async showEditDialog(cateId){
      const { data: res } = await this.$http.get(`categories/${cateId}`);
      if (res.meta.status !== 200) {
        return this.$message.error("查询分类信息失败");
      }
      this.editDialogVisible = true;
      this.editForm = res.data
      this.$message.success("查询分类成功")
    },

// 修改分类
    editCate(){
        this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}`, {cat_name: this.editForm.cat_name});
        if (res.meta.status !== 200) {
          return this.$message.error("修改分类失败");
        }
        this.editDialogVisible = false;
        this.getCateList();
        this.$message.success("修改分类成功");
      });
    },
    // 删除分类
    removeCateById(cateId){
      this.$confirm('确认要删除该分类嘛？, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const{data:res} = await this.$http.delete(`categories/${cateId}`)
          if(res.meta.status !== 200){
            return this.$message.error('删除分类失败失败');
          }
          this.getCateList()
          this.$message.success("删除成功");
        }).catch(() => {
          this.$message.message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    }
  },
};
</script>

<style lang='less' scoped>
.el-cascader {
  width: 100%;
}
.tree-table {
  margin-top: 15px;
}
</style>