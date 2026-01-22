import { createRouter, createWebHistory } from "vue-router"
import HomeView from "./routes/HomeView.vue"

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            component: HomeView
        }
    ]
})

export default router
