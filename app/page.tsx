import Link from "next/link"
import { BarChart3, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            Instagram Data Analysis Project
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Analyze Instagram data patterns, user engagement, and content performance with our powerful analytics tools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-0">
              <Link href="/search-filters">
                <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 h-full">
                  <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-6">
                    <Filter className="w-8 h-8 text-purple-600 dark:text-purple-300" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Search Filters</h2>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                    Filter and search through Instagram data based on users, tags, dates, and engagement metrics.
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">Explore Filters</Button>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-0">
              <Link href="/data-analysis">
                <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 h-full">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                    <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Data Analysis</h2>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                    Visualize trends, engagement patterns, and user behavior with interactive charts and reports.
                  </p>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">View Analytics</Button>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Database Structure</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border dark:border-gray-700 rounded-md p-4">
                <h3 className="font-bold mb-2 text-purple-600 dark:text-purple-400">Users</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">id, username, created_at</p>
              </div>
              <div className="border dark:border-gray-700 rounded-md p-4">
                <h3 className="font-bold mb-2 text-purple-600 dark:text-purple-400">Tags</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">id, tag_name, created_at</p>
              </div>
              <div className="border dark:border-gray-700 rounded-md p-4">
                <h3 className="font-bold mb-2 text-purple-600 dark:text-purple-400">Photos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">id, image_url, user_id, created_at</p>
              </div>
              <div className="border dark:border-gray-700 rounded-md p-4">
                <h3 className="font-bold mb-2 text-purple-600 dark:text-purple-400">Photo Tags</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">photo_id, tag_id</p>
              </div>
              <div className="border dark:border-gray-700 rounded-md p-4">
                <h3 className="font-bold mb-2 text-purple-600 dark:text-purple-400">Likes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">user_id, photo_id, created_at</p>
              </div>
              <div className="border dark:border-gray-700 rounded-md p-4">
                <h3 className="font-bold mb-2 text-purple-600 dark:text-purple-400">Follows</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">follower_id, followee_id, created_at</p>
              </div>
              <div className="border dark:border-gray-700 rounded-md p-4 md:col-span-2 lg:col-span-3">
                <h3 className="font-bold mb-2 text-purple-600 dark:text-purple-400">Comments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  id, comment_text, user_id, photo_id, created_at
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

