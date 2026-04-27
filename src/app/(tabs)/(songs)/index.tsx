import { TracksList } from '@/components/TracksList'
import { screenPadding } from '@/constants/tokens'
import { trackTitleFilter } from '@/helpers/filter'
import { generateTracksListId } from '@/helpers/miscellaneous'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { addTracks, useTracks } from '@/store/library'
import { defaultStyles } from '@/styles'
import { useMemo } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import DocumentPicker, { types } from 'react-native-document-picker'

const SongsScreen = () => {
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Find in songs',
		},
	})

	const tracks = useTracks()

	const filteredTracks = useMemo(() => {
		if (!search) return tracks

		return tracks.filter(trackTitleFilter(search))
	}, [search, tracks])

	const handleSelectFiles = async () => {
		try {
			const results = await DocumentPicker.pick({
				type: [types.audio],
				allowMultiSelection: true,
			})

			const newTracks = results.map((file) => ({
				url: file.uri,
				title: file.name?.replace(/\.[^/.]+$/, '') || 'Unknown Track',
				artist: 'Unknown Artist',
				artwork: undefined,
				rating: 0,
				playlist: [],
			}))

			addTracks(newTracks)
			Alert.alert('Success', `${newTracks.length} track(s) added`)
		} catch (err) {
			if (DocumentPicker.isCancel(err)) {
				console.log('User cancelled the picker')
			} else {
				Alert.alert('Error', 'Failed to select files')
			}
		}
	}

	return (
		<View style={defaultStyles.container}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={{ 
					paddingHorizontal: screenPadding.horizontal,
					paddingTop: 50, // Search bar'ın altına inmesi için ekstra boşluk
					paddingBottom: 40 
				}}
			>
				{/* Butonu ScrollView'un en başına aldık */}
				<TouchableOpacity
					onPress={handleSelectFiles}
					activeOpacity={0.7}
					style={{
						backgroundColor: '#007AFF',
						padding: 15,
						borderRadius: 12,
						marginBottom: 20,
						alignItems: 'center',
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.1,
						shadowRadius: 4,
						elevation: 3,
					}}
				>
					<Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
						+ Select Music Files
					</Text>
				</TouchableOpacity>

				<TracksList
					id={generateTracksListId('songs', search)}
					tracks={filteredTracks}
					scrollEnabled={false}
				/>
			</ScrollView>
		</View>
	)
}

export default SongsScreen