<template>
<div>
<!-- 面包屑导航 -->
<el-breadcrumb separator-class="el-icon-arrow-right">
  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>权限管理</el-breadcrumb-item>
  <el-breadcrumb-item>权限列表</el-breadcrumb-item>
</el-breadcrumb>
<!-- 卡片视图 -->
<el-card>
  <!-- 添加角色按钮区域 -->
  <el-row>
      <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
      </el-col>
  </el-row>
  <!-- 角色列表区域 -->
  <el-table :data="rolelist" border stripe>
    <!-- 展开列 type="expand" 可设置展开了-->
    <el-table-column type="expand">
      <!-- 用插槽接收 -->
      <template slot-scope="scope">
        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
          <!-- 渲染一级权限 -->
          <el-col :span="5">
            <el-tag closable @close="removeUserById(scope.row, item1.id)">{{item1.authName}}</el-tag>
            <i class="el-icon-caret-right"></i>
          </el-col>
          <!-- 渲染二级和三级权限 -->
          <el-col :span="19">
            <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
              <el-col :span="6">
                <el-tag type="success" closable @close="removeUserById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 三级 -->
              <el-col :span="18">
                <el-tag :class="[i3]" type="warning" closable @close="removeUserById(scope.row, item3.id)" v-for="(item3, i3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </template>
    </el-table-column>
    <!-- 索引列 -->
    <el-table-column type="index" label="序号"></el-table-column>
    <el-table-column label="角色名称" prop="roleName"></el-table-column>
    <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
    <el-table-column label="操作" width="300px">
      <template slot-scope="scope">
        <!--  -->
        <el-button size="mini" type="primary" icon="el-icon-edit"  @click="showEditDialog(scope.row.id)">编辑</el-button>
        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)">删除</el-button>
        <!-- 分配按钮 -->
            <el-tooltip class="item" effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
</el-card>
<!-- 添加用户对话框 -->
<el-dialog
  title="添加角色"
  :visible.sync="addDialogVisible" width="50%"
  @close="addDialoClosed">
<!-- 内容主题区 -->
<el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules">
  <el-form-item label="角色名称" prop="roleName">
    <el-input v-model="addForm.roleName"></el-input>
  </el-form-item>
  <el-form-item label="角色描述" prop="roleDesc">
    <el-input v-model="addForm.roleDesc"></el-input>
  </el-form-item>
</el-form>
<!-- 按钮区 -->
<span slot="footer" class="dialog-footer">
  <el-button @click="addDialogVisible = false">取 消</el-button>
  <el-button type="primary" @click="addUser" >确 定</el-button>
</span>
</el-dialog>
<!-- 修改用户对话框 -->
<el-dialog
  title="修改用户"
  :visible.sync="editDialogVisible"
  width=50% @close="editDialogClosed">
  <el-form ref="editFormRef" :model="editForm" label="70px" :rules="editFormRules">
    <el-form-item label="角色名称">
      <el-input v-model="editForm.roleName" disabled></el-input>
    </el-form-item>
    <el-form-item label="角色描述" prop="roleDesc">
      <el-input v-model="addForm.roleDesc"></el-input>
    </el-form-item>
  </el-form>
  <!-- 按钮区 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo" >确 定</el-button>
  </span>
</el-dialog>
<!-- 分配权限对话框 -->
<el-dialog
  title="分配权限"
  :visible.sync="setRightDialogVisible"
  width=50% @close="setRightDialogClosed">
  <!-- 树形结构 -->
<el-tree
  ref="treeRef"
  :data="rightlist"
  :props="treeProps"
  show-checkbox node-key="id"
  default-expand-all :default-checked-keys="defKeys"></el-tree>
  <!-- 按钮区 -->
  <span slot="footer" class="dialog-footer">
  <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights" >确 定</el-button>
  </span>
  </el-dialog>
</div>
</template>
<script>
export default {
  data() {
    return {
      // 所有角色数据列表
      rolelist: [],
      // 添加用户对话框是否显示
      addDialogVisible: false,
      // 是否显示修改用户弹窗
      editDialogVisible: false,
      // 分配权限显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightlist: [],
      // 当前即将分配权的iD
      roleId: '',
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id
      defKeys: [105, 116, 117],
      // 添加用户表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加表单验证规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名长度在3-10个字符之间' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 6, max: 15, message: '角色描述长度在6-15个字符之间' }
        ]
      },
      // 修改表单验证规则
      editFormRules: {
        roleName: [{ required: true, message: '请输入角色名', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
      },
      // 查询到用户信息对象
      editForm: {}
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
  // 获取所有数据的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolelist = res.data
      console.log(this.rolelist)
    },
    // 点击添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加用户的请求
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          // 失败
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        console.log(res.data)
        // 成功后隐藏对话框
        this.addDialogVisible = false
        // 添加后 刷新数据列表
        this.getRolesList()
      })
    },
    addDialoClosed() {
      console.log('关闭：', this.$refs)
      this.$refs.addFormRef.resetFields()
    },
    // 编辑
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户数据失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改用户信息的请求
        const { data: res } = await this.$http.put('roles/' + this.editForm.id,
          { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！')
        }
        console.log(this.editForm.id)
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新列表
        this.getRolesList()
        // 提示修改成功
        this.$message.success('更新用户信息成功')
      })
    },
    // 关闭修改用户对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    // 根据ID删除用户信息
    async removeUserById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      // 删除用户信息接口 roles/:roleId/rights/:rightId
      // const { data: res } = await this.$http.delete('roles/' + id)
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功！')
      // 重新给role重新赋值
      role.children = res.data
    },

    async showSetRightDialog (role) {
      // 获取id
      this.roleId = role.id

      // 获取所有权限数据列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        this.$message.error('获取数据失败！')
      }
      console.log(this.rightlist)
      // 把获取到的权限数据保存在data中
      this.rightlist = res.data

      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归获取角色下的所有三级权限id,并保存到 defKeys中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含chhildren属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item =>
        this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击确定为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      // 分割数组
      const idStr = keys.join(',')

      // 角色授权数据
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      // 刷新列表
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
