<template>
  <div>
     <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 面包屑导航 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示消息 -->
      <el-alert title="修改商品信息" type="info" :closable="false" show-icon center></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 标签页 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" label-position='top'>
        <el-tabs v-model="activeIndex" :tab-position="tabPosition" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="editForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model.number="editForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model.number="editForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader v-model="editForm.goods_cat" :options="cateList" :props="cascaderProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(value,i) in item.attr_vals" :label="value" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action指定图片上传的api地址-->
            <el-upload :action="upLoadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success="handleSucce" :file-list="fileList">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="editForm.GoodsContent" />
            <!-- 添加按钮 -->
            <el-button type="primary" class="btn-add" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览时打开对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 设置Tabs标签页的排列显示为竖向左侧展示
      tabPosition: "left",

      activeIndex: "0",

      editForm: {
        goods_name: '',
        goods_price: null,
        goods_weigh: null,
        goods_number: null,
        //商品所属分类的数组
        goods_cat: [],

        //上传图片的临时路径
        pics: [],

        //富文本编辑器编辑商品内容
        GoodsContent: "",
        //商品的参数
        attrs:[],
      },

      editFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
      },

      // 分类数据
      cateList: [],

      //级联选择器配置项
      cascaderProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
        expandTrigger: "hover",
      },
      //动态参数
      manyData: [],
      //静态属性
      onlyData: [],

      //图片上传地址
      upLoadURL: "http://www.tangxiaoyang.vip:8888/api/v2/upload",

      //文件上传时请求头token信息
      headersObj: {
        Authorization: JSON.parse(sessionStorage.getItem("userInfo")).token,
      },

      //图片预览对话框默认关闭
      previewVisible: false,

      //图片预览路径
      previewPath: "",

      //商品的图片显示
      fileList:[]
    };
  },
  created() {
    this.getGoodById();
    this.getCateList();
  },
  methods: {
    //根据id获取商品信息
    async getGoodById(){
      const {data:res} = await this.$http.get(`goods/${this.$route.query.id}`)
      if(res.meta.status !== 200){
        return this.$message.error('修改用户失败');
      }
      //此时级联选择器，默认返回的是所有分类
      //此时res.data返回的 good_cat 参数是字符串类型,以逗号分割成数组
      //并将其转化为数组类型，并且数组内的是数值类型
      res.data.goods_cat = res.data.goods_cat.split(',').map(item => {
        return item*1
      })
      //提交数据到editForm，这样就实现了，级联选择器的默认选择

      res.data.pics.forEach(item =>{
        this.fileList.push({
          name:item.pics_id,
          url:item.pics_big_url.replace('127.0.0.1','www.tangxiaoyang.vip'),//把本地的接口基准地址：www.tangxiaoyang.vip
          tmp_path:item.pics_big_url //移除图片的时候要用
        })
        item.pic = item.pics_big
      })
      this.editForm = res.data;
    },



    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败");
      }
      this.cateList = res.data;
    },

    handleChange() {
      if (this.editForm.goods_cat.length !== 3) {
        this.editForm.goods_cat = []; //如果没有选择三级分类，重置为空
      }
    },

    //tab切换之前触发
    beforeTabLeave(activeName, oldActiveName) {
      if (this.editForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类!");
        return false;
      }
    },
    //tabs被选中时触发
    async tabClicked() {
      //判断是动态参数还是静态属性

      // 通过之前的activeIndex来确认
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数失败");
        }
        //以空格拆分参数信息
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        });
        this.manyData = res.data;
        console.log(res.data);
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数失败");
        }
        //静态属性不需要分割数据
        this.onlyData = res.data;
        console.log(this.onlyData);
      }
    },

    //预览图片
    handlePreview(file) {
      this.previewVisible = true;
      this.previewPath = file.url;
    },

    //移除图片
    handleRemove(file) {
      //获取将要删除图片的临时路径
      const filePath = file.tmp_path || file.response.data.tmp_path;
      //从pic数组中找到对应图片的索引值
      const i = this.editForm.pics.findIndex((item) => {
        item.pic === filePath;
      });
      //从pic数组中移除
      this.editForm.pics.splice(i, 1);
      console.log (this.editForm.pics)
    },
    // 将图片的临时路径push到editForm的pics数组中
    handleSucce(response) {
      this.editForm.pics.push({
        pic: response.data.tmp_path,
      });
       console.log (this.editForm.pics)
    },

    //添加商品
    addGoods(){
      //表单先校验通过
      this.$refs.editFormRef.validate(async (valid) => {
          if (!valid) {
            return
          } 
          // 准备请求前的数据
          //处理商品所属的数据
          //this.editForm.goods_cat = this.editForm.goods_cat.join(',') 级联选择器要求必须是数组，变成字符串以后级联选择器会失效
          //定义一个新的对象，将editForm拷贝过来
          //使用lodash工具实现深拷贝
          const form = _.cloneDeep(this.editForm); //深拷贝
          form.goods_cat = form.goods_cat.join(',')
          console.log(form)

          //处理动态参数
          this.manyData.forEach(item => {
            form.attrs.push({
                attr_id: item.attr_id,
                attr_value: item.attr_vals.join(' ')
              })
            })

          //处理静态属性
            this.onlyData.forEach(item => {
            form.attrs.push({
                attr_id:item.attr_id,
                attr_value:item.attr_vals
              })
            })  

          //发送请求，添加商品
          const {data:res} = await this.$http.post(`goods`,form)
          if(res.meta.status !== 201){
            return this.$message.error('添加商品失败');
          }
          this.$message.success('添加商品成功!')
          this.$router.push('/goods')
         })
  },
  },

  computed: {
    cateId() {
      return this.editForm.goods_cat.length === 3 ? this.editForm.goods_cat[2] : null;
    },
  },
};
</script>

<style lang='less' scoped>
.el-checkbox {
  margin-right: 10px;
}
.el-dialog img {
  width: 100%;
}
.btn-add {
  margin-top: 15px;
}
</style>