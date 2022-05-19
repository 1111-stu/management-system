<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 面包屑导航 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索和添加 -->
          <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click=" addDialogVisible = true">添加用户</el-button>
        </el-col>
        <!-- 搜索和添加 -->
      </el-row>
      <!-- 用户列表数据展示 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="索引" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"> </el-table-column>
        <el-table-column label="邮箱" prop="email"> </el-table-column>
        <el-table-column label="电话" prop="mobile"> </el-table-column>
        <el-table-column label="角色" prop="role_name"> </el-table-column>
        <el-table-column label="状态">
          <!-- 表格自定义模板元，使用作用域插槽，通过scope.row获取当前行的数据 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserByid(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRoleDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户表单弹窗 -->
    <el-dialog title="提示" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose" label-width="100px" class="demo-ruleForm">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息弹窗 -->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose" label-width="100px" class="demo-ruleForm">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="roleDialogVisible" width="50%" @close="setroleDialogClose" label-width="100px">
      <p>{{userInfo.username}}</p>
      <p>{{userInfo.role_name}}</p>
      <!--如果用户刷新了角色的值如何获取到呢？通过双向绑定的selectedRoleId  -->
      <el-select v-model="selectedRoleId" placeholder="请选择">
        <el-option v-for="item in rolelist" :key="item.id" :label="item.roleName" :value="item.id">
        </el-option>
      </el-select>
      <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRole">确 定</el-button>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询用户列表的参数对象
      queryInfo: {
        query: "",
        pagenum: 1, //页码
        pagesize: 5, //页大小
      },
      //用户列表数据
      userList: [],
      //获取用户信息总条数
      total: 0,
      //添加对话框的隐藏与显示
      addDialogVisible: false,
      //   添加用户的表单数据对象
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      //   添加用户的校验规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            pattern: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
            message: "邮箱格式不正确",
            trigger: "blur",
          },
        ],

        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          {
            pattern:
              /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
            message: "手机号格式不正确",
          },
        ],
      },
      //添加修改用户信息的隐藏与显示
      editDialogVisible: false,
      //   添加修改用户信息的的表单数据对象
      editForm: {
        username: "",
        email: "",
        mobile: "",
      },
      //   添加修改用户信息的校验规则
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            pattern: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
            message: "邮箱格式不正确",
            trigger: "blur",
          },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          {
            pattern:
              /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
            message: "手机号格式不正确",
          },
        ],
      },
      //分配角色拿到的用户数据
      userInfo: {},
      //分配角色对话框的开关
      roleDialogVisible: false,
      //角色列表
      rolelist: [],
      selectedRoleId:null
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败");
      }
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    //监听pagesize改变的事件
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getUserList();
    },
    // 监听pagenum改变的事件
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getUserList();
    },
    //监听swith状态的改变
    async userStateChange(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      ); //`是反单引号不是单纯的英文单引号
      if (res.meta.status !== 200) {
        // 更新失败时恢复为原始状态
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败！");
      }
      this.$message.success("更新用户状态成功！");
    },
    //监听添加用户对话框的关闭事件,关闭对话框的话，清空输入记录。element-ui:resetFields()恢复表单的初始值
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    //添加用户的数据到后台数据库
    // 添加用户
    addUser() {
      //添加async的时候，注意是一个函数，传的参数要写在括号里（）否则会获取接口失败。
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }

        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败");
        }

        // 关闭对话框
        this.addDialogVisible = false;
        // 刷新用户列表
        this.getUserList();
        // 提示添加成功
        this.$message.success("添加用户成功");
      });
    },

    //显示修改用户邮箱手机号信息的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`users/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户失败");
      }
      this.editForm = res.data; //   this.editForm = this.res.data data已经在const{data：res}定义了直接使用即可，不需要使用this指向了
      this.editDialogVisible = true;
    },
    //修改后台数据库的用户信息
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改用户信息失败");
        }
        // 关闭对话框
        this.editDialogVisible = false;
        // 刷新用户列表
        this.getUserList();
        // 提示信息修改成功
        this.$message.success("修改用户信息成功");
      });
    },
    //监听修改用户对话框的关闭事件,关闭对话框的话，清空输入记录。
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 删除用户信息
    removeUserByid(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`users/${id}`);
          if (res.meta.status !== 200) {
            return this.$message.error("删除用户信息失败");
          }
          this.getUserList();
          this.$message.success("删除成功");
        })
        .catch(() => {
          this.$message.info("取消成功");
        });
    },
    //展示分配角色对话框
    async showRoleDialog(userInfo) {
      this.userInfo = userInfo;
      this.roleDialogVisible = true;
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.rolelist = res.data;
      console.log(this.rolelist);
      this.$message.success("获取角色列表成功");
    },
    setroleDialogClose() {
      this.selectedRoleId = null
    },
    async allotRole(){
      //先判断是否选择了角色，如果没有选择角色，提示错误信息
      if( this.selectedRoleId == null)
      {
        this.$message.error("请选择角色信息")
      }
      //修改角色信息后发送数据给后台
      const{data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid: this.selectedRoleId})
      if(res.meta.status !== 200){
        return this.$message.error('更新角色失败');
      }
      this.$message.success("更新角色成功")
      this.getUserList()
      this.roleDialogVisible = false
    }
  },
};
</script>

<style lang="less" scoped >
</style>