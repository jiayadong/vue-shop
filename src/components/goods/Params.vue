<template>
<div>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>参数列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片试图 -->
  <el-card>
    <el-alert title="注意:只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon></el-alert>
    <!-- 选择商品分类区域 -->
    <el-row class="cat_opt">
      <el-col>
        <span>选择商品分类：</span>
        <!-- 选择商品的级联选择框 -->
        <el-cascader
          v-model="selectedCatdKeys"
          :options="catelist"
          expand-Trigger="hover"
          :props="cateProps"
          @change="handleChange">
          </el-cascader>
      </el-col>
    </el-row>
    <!-- 页签区域 -->
     <el-tabs v-model="activeName" @tab-click="handleTabsClick">
       <!-- 添加动态参数面板 -->
      <el-tab-pane label="动态参数" name="many">
        <!-- 添加参数的按钮 -->
        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
        <!-- 动态参数表格 -->
        <el-table :data="manyTableData" border stripe>
          <!-- 展开行 -->
          <el-table-column type="expand"></el-table-column>
          <!-- 索引列 -->
          <el-table-column type="index"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialg(scope.row.attr_id)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- 添加静态属性面板 -->
      <el-tab-pane label="静态属性" name="only">
        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
        <!-- 静态属性表格 -->
        <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialg(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
        </el-table>
      </el-tab-pane>
     </el-tabs>
  </el-card>
  <!-- 添加参数的对话框 -->
  <el-dialog
  :title="'添加' + titleText"
  :visible.sync="addDialogVisible"
  width="50%"
  @close="addDialogClosed">
  <!-- 添加参数的对话框 -->
  <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
    <el-form-item :label="titleText" prop="attr_name">
      <el-input v-model="addForm.attr_name"></el-input>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
  </el-dialog>
  <!-- 修改参数对话框 -->
  <el-dialog
  :title="'修改' + titleText"
  :visible.sync="editDialogVisible"
  width="50%"
  @close="editDialogClosed">
  <!-- 添加参数的对话框 -->
  <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
    <el-form-item :label="titleText" prop="attr_name">
      <el-input v-model="editForm.attr_name"></el-input>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
  </el-dialog>
</div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定的数据
      selectedCatdKeys: [],
      // 被激活的页签
      activeName: 'many',
      // 动态参数
      manyTableData: [],
      // 静态参数
      onlyTableData: [],
      // 控制添加对话框的显示隐藏
      addDialogVisible: false,
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改的表单数据
      editForm: {},
      // 修改的表单验证
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCatList()
  },
  methods: {
    // 获取所有商品分类
    async getCatList() {
      const { data: res } = await this.$http('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.catelist = res.data
      console.log('获取商品分类getCatList：' + this.catelist)
    },
    // 级联选择框选择项变化，会发触发当前函数
    handleChange() {
      this.getParmsData()
    },
    // tab页签点击事件
    handleTabsClick() {
      this.getParmsData()
      console.log(this.activeName)
    },
    // 获取参数的列表数据
    async getParmsData() {
      // 选中的不是三级分类
      if (this.selectedCatdKeys.length !== 3) {
        this.selectedCatdKeys = []
        return
      }
      console.log(this.selectedCatdKeys)

      // 根据所选分类的Id和当前索取的面板，获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })

      console.log('cateid2:', this.cateId)
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      if (this.activeName === 'many') {
        this.manyTableData = res.data
        console.log('动态：', this.manyTableData)
      } else {
        this.onlyTableData = res.data
      }
    },
    // 关闭添加对话框弹窗
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮，添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加数据成功！')
        this.addDialogVisible = false
        //  成功后关闭对话框
      })
    },
    // 修改对话框
    showEditDialg() {
      this.editDialogVisible = true
    },
    // 重置修改的表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确认后修改参数，(修改对话框里的)
    editParams() {}
  },
  computed: {
    // 如果按钮需要被禁用，则返回false,否则返回true
    isBtnDisabled() {
      if (this.selectedCatdKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类id
    cateId() {
      if (this.selectedCatdKeys.length === 3) {
        return this.selectedCatdKeys[2]
      }
      return null
    },
    // 计算标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style scoped>
.cat_opt {
  margin:15px 0;
}
</style>
