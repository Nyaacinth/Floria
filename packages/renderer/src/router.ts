import { createRouter, createWebHistory } from "vue-router"
import HomeView from "./routes/HomeView.vue"

export default createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            component: HomeView
        }
    ]
})
