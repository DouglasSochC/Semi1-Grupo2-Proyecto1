import React, { lazy } from 'react'
import { HomeRedirect } from './RouteUtils'
import RouteController from './RouteController'
//import HomeAdmin from '../components/views/HomeAdmin'
const Dashboard = lazy(() => import('../components/views/Dashboard'))
const Login = lazy(() => import('../components/views/Login'))
const Home = lazy(() => import('../components/views/Home'))
const HomeAdmin = lazy(() => import('../components/views/HomeA'))
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
        routes: [
            {
                path: "/app",
                exact: true,
                render: props => <RouteController component={Dashboard} {...props} />
            }
        ]
    },
    {
        path: "/app_admin",
        render: props => <RouteController component={HomeAdmin} {...props} />,
        routes: [
            {
                path: "/app/admin",
                exact: true,
                render: props => <RouteController component={Dashboard} {...props} />
            }
        ]
    }

]

export default routes