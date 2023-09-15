import React, { lazy } from 'react'
import { HomeRedirect } from './RouteUtils'
import RouteController from './RouteController'
const Dashboard = lazy(() => import('../components/views/Dashboard'))
const Login = lazy(() => import('../components/views/Login'))
const Home = lazy(() => import('../components/views/Home'))
// pagina para crear cuenta
const Register = lazy(() => import('../components/views/Register'))

const routes = [
    {
        path: "/",
        exact: true,
        component: HomeRedirect
    },
    {
        path: "/login",
        exact: true,
        render: props => <Login {...props} />
    },
    {
        path: "/register",
        exact: true,
        render: props => <Register {...props} />
    },
    {
        path: "/app",
        render: props => <RouteController component={Home} {...props} />,
       
    },
    {
        path: "/home",
        exact: true,
        render: props => <RouteController component={Home} {...props} />
    }

]

export default routes