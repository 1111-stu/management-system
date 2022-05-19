import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:'/login',
    component:Login
  },
  {
    path:'/home',
    component:() => import('../components/Home.vue'),
    redirect:'/welcome',
    children:[
      { path:'/welcome',component:() => import('../components/index/Welcome.vue')},
      { path:'/users', component:() => import('../components/user/Users.vue') },
      { path:'/roles', component:() => import('../components/right/Role.vue') },
      { path:'/categories', component:() => import('../components/goods/Cate.vue') },
      { path:'/params', component:() => import('../components/goods/Params.vue') },
      { path:'/goods', component:() => import('../components/goods/List.vue') },
      { path:'/goods/add', component:() => import('../components/goods/add.vue') },
      { path:'/goods/edit', component:() => import('../components/goods/Edit.vue') },
      { path:'/orders', component:() => import('../components/order/Orders.vue') }
    ]
  }
]


//实例路由对象
const router = new VueRouter({
  routes
})

//配置路由信息
router.beforeEach((to,from,next) => {
  //如果访问登录页，则放行
  if(to.path === '/login'){
    return next()
  }
  //如果用户未登录，则跳转到/login
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  if(!userInfo )
  {
    return next('/login')
  }
  //如果用户已登录，则放行
  next()
})
export default router
