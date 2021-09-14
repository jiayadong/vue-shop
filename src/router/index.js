import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'

Vue.use(VueRouter)
const routes = [
  // 访问根路径时，X重定向到login
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      // 将home路径重定向到welcome
      { path: '/welcome', component: Welcome },
      // 将users以子组件形式放入home里
      { path: '/users', component: Users },
      // 权限列表 组件以路由的形式加载显示出页面
      { path: '/rights', component: Rights },
      // 角色列表 组件以路由的形式加载显示出页面
      { path: '/roles', component: Roles },
      // 商品分类
      { path: '/categories', component: Cate },
      // 分类参数
      { path: '/params', component: Params }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 挂在路由导航守卫 beforeEach 三个形参
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行函数；两种方式：直接放行 next(); next('/login') 强制跳转路径

  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  // 如果tokenstr不存在(即未登录)，强制跳转到登录页
  next()
  // 如果存在直接放行
})

export default router
