<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- isCollapse为true则折叠，宽度变小否则还是200 -->
      <el-aside width="isCollapse ? '64px' : '200px'" >
        <!--侧边栏  -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单 导航组件的各种属性 -->
          <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff"
                  unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + '' " v-for="item in menulist" :key="item.id" >
            <!-- 一级菜单的模板去区 -->
            <template slot="title">
              <!-- 图标  iconsObj[item.id]-->
              <i class="el-icon-location"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children"
            :key="subItem.id" @click="saveNavState('/'+subItem.path)">
              <template slot="title">
              <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文本 -->
              <span>{{subItem.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主窗体 -->
      <el-main>
        <!-- 路由占位 -->
        <router-view>路由占位</router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
      // iconsObj: {
      //   '125': 'iconfont icon-user',
      //   '103': 'iconfont icon-tijikongjian',
      //   '101': 'iconfont icon-shangpin',
      //   '102': 'iconfont icon-danju',
      //   '145': 'iconfont icon-baobiao'
      // }
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      // 清空 token
      window.sessionStorage.clear()
      // 重定向到登录页
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error()
      this.menulist = res.data
      console.log(res)
    },
    toggleCollapse() {
      // 点击切换菜单折叠与展开
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      // 保存链接的激活状态
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style scoped>
.home-container{
  height: 100%;
}
.el-header{
  background-color:#373d41;
  display: flex;
  justify-content: space-between;
  padding-left:0;
  align-items: center;
  color:#fff;
  font-size: 20px;

}
.el-header div{
  display: flex;
  align-items:center;
}
.el-header div span{
  margin-left:15px;
}
.el-aside{
  background-color:#333744;
}
.el-main{
  background-color: #EAEDF1;
}
.el-menu{
  border-right: none;
}

.toggle-button{
  background-color: #4a5064;
  color:#fff;
  font-size:10px;
  line-height:24px;
  text-align: center;
  letter-spacing: .2em;
  cursor: pointer;
}
</style>
