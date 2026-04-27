import { FloatingPlayer } from '@/components/FloatingPlayer'
import { colors, fontSize } from '@/constants/tokens'
import { FontAwesome, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'

const TabsNavigation = () => {
	return (
		<>
			<Tabs
				screenOptions={{
					tabBarActiveTintColor: colors.primary,
					tabBarLabelStyle: {
						fontSize: fontSize.xs,
						fontWeight: '500',
					},
					headerShown: false,
					tabBarStyle: {
						backgroundColor: colors.background,
						borderTopWidth: 1,
						borderTopColor: '#E0E0E0',
						paddingTop: 8,
						paddingBottom: 8,
						height: 60,
						elevation: 8,
					},
				}}
			>
				<Tabs.Screen
					name="favorites"
					options={{
						title: 'Favorites',
						tabBarIcon: ({ color }) => <FontAwesome name="heart" size={20} color={color} />,
					}}
				/>
				<Tabs.Screen
					name="playlists"
					options={{
						title: 'Playlists',
						tabBarIcon: ({ color }) => (
							<MaterialCommunityIcons name="playlist-play" size={28} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="(songs)"
					options={{
						title: 'Songs',
						tabBarIcon: ({ color }) => (
							<Ionicons name="musical-notes-sharp" size={24} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="artists"
					options={{
						title: 'Artists',
						tabBarIcon: ({ color }) => <FontAwesome6 name="users-line" size={20} color={color} />,
					}}
				/>
			</Tabs>

			<FloatingPlayer
				style={{
					position: 'absolute',
					left: 8,
					right: 8,
					bottom: 78,
				}}
			/>
		</>
	)
}

export default TabsNavigation
