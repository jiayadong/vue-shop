<template>
<div>
<!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品分类</el-breadcrumb-item>
  </el-breadcrumb>

<!-- 卡片视图区域 -->
<el-card>
  <el-row>
      <el-col>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-col>
  </el-row>
<!-- 表格 -->
<tree-table class="treeTable" :data="catelist"
:columns="columns"
:selection-type="false"
:expand-type="false"
show-index
border
:show-row-hover="false">
<!-- 是否有效 -->
  <template slot="isok" slot-scope="scope">
    <i class="el-icon-success"
    v-if="scope.row.cat_deleted === false"
    style="color:lightgreen"></i>
    <i class="el-icon-error" v-else
    style="color:red"></i>
  </template>
  <!-- 排序 -->
  <template slot="order" slot-scope="scope">
    <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
    <el-tag type="warning" size="mini" v-else>三级</el-tag>
  </template>
  <!-- 操作 -->
  <template slot="scope">
    <el-button size="mini" type="primary" icon="el-icon-edit"  @click="showEditDialog(scope.row.id)">编辑</el-button>
    <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)">删除</el-button>
  </template>
</tree-table>

<!-- 分页区域 -->
<el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="querInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="querInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
</el-pagination>
</el-card>
<!-- 添加分类对话框 -->
<el-dialog
  title="添加分类"
  :visible.sync="addCateDialogVisible"
  width="50%" @close="addCateDialogClosed">
  <!-- 添加分类表单 -->
  <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
    <el-form-item label="分类名称：" prop="cat_name">
      <el-input v-model="addCateForm.cat_name"></el-input>
    </el-form-item>
    <el-form-item label="父级名称：">
      <!--options 指定数据源
        props 用来指定配置对象
      -->
      <el-cascader expand-trigger='hover' v-model="selectedKeys" :options="parentCateList"
      :props="cascaderProps"
      @change="parentCateChanged" clearable >
      </el-cascader>
    </el-form-item>
    </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>
</div>
</template>

<script>
export default {
  data() {
    return {
    // 商品分类数据列表，默认为空
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //  将当前列定义为模板列
          type: 'template',
          //  当前列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          //  将当前列定义为模板列
          type: 'template',
          //  当前列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          //  将当前列定义为模板列
          type: 'template',
          //  当前列使用的模板名称
          template: 'opt'
        }
      ],
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类层级，默认是1级分类；0是1级，1是2级，`2`表示三级
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        childeren: 'childeren'
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      // 把数据列表，赋值给catelist
      this.catelist = res.data.result
      // 总条数赋值
      this.total = res.data.total
    },
    // 监听分页的改变
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList() // 刷新数据列表
    },
    // 添加分类的对话框
    showAddCateDialog () {
      // 先获取数据列表，在展示对话框
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      console.log(res.data)
      this.parentCateList = res.data
    },
    //  选择项发生变化触发当前函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果selectedKeys 数组中的length大于0，证明选中的父级分类
      // 反之,就说明 没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 当前分类等级
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        // 当前分类等级
        this.addCateForm.cat_level = 0
      }
    },
    // 点击确定按钮，添加新分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听关闭弹窗,重置表单
    addCateDialogClosed () {
      // 清空分类名称
      this.$refs.addCateFormRef.resetFields()
      // 清空父级数据选集
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 删除信息弹窗
    async removeUserById(rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 删除用户信息接口
      const { data: res } = await this.$http.delete('categories/' + rightId)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功！')
      this.getCateList()
    }
  }
}
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
  /* top: 263px; */
}
</style>
