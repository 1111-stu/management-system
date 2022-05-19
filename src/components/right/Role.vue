<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 面包屑导航 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-button size="mini" type="primary" @click="pushDialog">添加用户</el-button>
      <el-table :data="roleList" border stripe>
        <!--  展开列-->
        <el-table-column type="expand" label="明细">
          <template slot-scope="scope">
            <!-- 渲染一级权限 -->
            <el-row v-for="(item1,i1) in scope.row.children" :key=item1.id :class="{bdBottom:true,bdTop:i1==0,vcenter:true}">
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row v-for="(item2,i2) in scope.row.children" :key=item2.id :class="{bdTop:i2!=0,vcenter:true}">
                  <el-col :span="6">
                    <el-tag closable type="warning" @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag closable type="success" v-for="item3 in item2.children" :key=item3.id @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号">
        </el-table-column>
        <el-table-column prop="roleName" label="角色">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRoleData(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-sett" @click="showRighDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitData">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleData">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示树型权限的对话框 -->
    <el-dialog title="修改角色" :visible.sync="rightDialogVisible" width="50%">
       <!-- <el-tree ref="treeRef" :data="rightsList" :props="treeProps" node-key="id" show-checkbox default-expand-all :default-checked-keys="defaultKeys"></el-tree> -->
      <el-tree ref = "treeRef" :data = "rightList" :props = "treeProps" node-key="id" show-checkbox default-expand-all :default-checked-keys=" defaultKeys"></el-tree>
      <span slot="footer" class="dialog-footer" node-key = "id">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      addForm: {
        roleName: "",
        roleDesc: "",
      },

      editForm: {
        id: "",
        roleName: "",
        roleDesc: "",
      },

      // 添加用户对话框初始状态是关闭状态。
      addDialogVisible: false,

      // 修改用户对话框初始状态是关闭状态。
      editDialogVisible: false,

      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },

      // 修改角色的校验规则
      editFormRules: {
        roleName: [
          { required: true, message: "请修改角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请修改角色描述", trigger: "blur" },
        ],
      },

      rightDialogVisible: false,
      //分配角色，获取权限列表数据
      rightList: [],

      //树型组件的绑定对象
      treeProps:{
        label:'authName',
        children:'children'
      },

      // 默认选中的id值数组
      defaultKeys:[],

      //当前要分配权限的角色id
      roleId:"",
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get(`roles`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }
      this.$message.success("获取权限列表成功");
      this.roleList = res.data;
    },
    pushDialog() {
      this.addDialogVisible = true;
    },

    //点击添加角色，提交角色数据给后台服务器
    submitData() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败");
        }
        // 关闭对话框
        this.addDialogVisible = false;
        // 刷新用户列表
        this.getRoleList();
        // 提示添加成功
        this.$message.success("添加角色成功");
      });
    },

    //显示修改角色名称或者角色描述的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户失败");
      }
      this.editForm = res.data; //   this.editForm = this.res.data data已经在const{data：res}定义了直接使用即可，不需要使用this指向了
      this.editDialogVisible = true;
    },

    //修改后台数据库的用户信息
    editRoleData() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.put(
          `roles/${this.editForm.roleId}`,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改角色信息失败");
        }
        // 关闭对话框
        this.editDialogVisible = false;
        // 刷新用户列表
        this.getRoleList();
        // 提示信息修改成功
        this.$message.success("修改用户信息成功");
      });
    },
    //删除角色列表
    deleteRoleData(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`roles/${id}`);
          if (res.meta.status !== 200) {
            return this.$message.error("删除用户信息失败");
          }
          this.getRoleList();
          this.$message.success("删除成功");
        })
        .catch(() => {
          this.$message.info("取消成功");
        });
    },

    // 点击tag的x 实现删除一级二级三级权限功能
    removeRightById(role, rightId) {
      //具体要搞明白这两个参数是怎么传进来的
      this.$confirm("删除角色权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          );
          if (res.meta.status !== 200) {
            return this.$message.error("删除用户信息失败");
          }
          // this.getRoleList();不建议这样做，会导致角色列表所有数据刷新
          role.children = res.data; //重新设置当前角色下的权限数据，data就是最新返回的数据
          this.$message.success("删除成功");
        })
        .catch(() => {
          this.$message.info("取消成功");
        });
    },

    //点击分配角色展示树型权限的菜单
    async showRighDialog(role) {
      const { data: res } = await this.$http.get(`rights/tree`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }
      this.rightList = res.data;

// 存储当前要分配权限的角色id
      this.roleId = role.id
      //获取角色下三级权限的id
      this.getLeafKeys(role)

      console.log(this. defaultKeys)
      this.rightDialogVisible = true
    },

//提交设置好的树型权限菜单
     async allotRights(){
      const keys = this.$refs.treeRef.getCheckedKeys().concat(this.$refs.treeRef.getHalfCheckedKeys())
      const idStr = keys.join(',')
      const{data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{
        rids:idStr
      })
      if(res.meta.status !== 200){
        return this.$message.error('分配权限失败');
      }
      this.getRoleList();
        this.rightDialogVisible = false
      this.$message.success("分配权限成功")
    },

//获取角色下三级权限的id
    getLeafKeys(node){
      //判断是否为三级权限
      if(!node.children)
      {
        return this.defaultKeys.push(node.id)
      }
      // 如果不是三级权限，递归回调,直到找到没有children的就是三级权限
      node.children.forEach(item => {
        this.getLeafKeys(item)
      });
      }
  },
};
</script>

<style lang='less' scoped>
.el-tag {
  margin: 6px;
}
.bdTop {
  border-top: 1px solid #eee;
}
.bdBottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>