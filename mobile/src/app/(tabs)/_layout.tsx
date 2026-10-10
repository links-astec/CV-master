// The four main screens with the website's bottom bar (My CVs, Templates, +, Editor, Settings)
import { Tabs } from 'expo-router'
import { TabBar } from '@/components/shell'

export default function TabsLayout() {
  return (
    <Tabs tabBar={props => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="templates" />
      <Tabs.Screen name="editor" />
      <Tabs.Screen name="settings" />
    </Tabs>
  )
}
