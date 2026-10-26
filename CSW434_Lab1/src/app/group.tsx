
import {
  useEffect,
  useRef,
  useState
} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import { socket } from '../services/socket';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import ChatBubble, {
  ChatMessageType,
} from '../components/ChatBubble';

export default function GroupScreen() {
  const { username } = useLocalSearchParams<{
    username: string;
  }>();

  const currentUser =
    typeof username === 'string'
      ? username
      : 'Guest';

  const [message, setMessage] = useState('');

  const [messages, setMessages] =
    useState<ChatMessageType[]>([]);

  const flatListRef =
    useRef<FlatList<ChatMessageType>>(null);


  useEffect(() => {
    // Kết nối đến server
    socket.connect();

    // Thông báo người dùng tham gia chat
    socket.emit('join', currentUser);

    // Hàm xử lý khi nhận tin nhắn
    const handleNewMessage = (
      newMessage: ChatMessageType,
    ) => {
      setMessages((previousMessages) => [
        ...previousMessages,
        newMessage,
      ]);
    };

    // Đăng ký sự kiện nhận tin nhắn
    socket.on(
      'new_message',
      handleNewMessage,
    );

    // Cleanup khi rời màn hình
    return () => {
      socket.off(
        'new_message',
        handleNewMessage,
      );

      socket.disconnect();
    };
  }, [currentUser]);



  const handleSendMessage = () => {
    const text = message.trim();

    if (!text) {
      return;
    }

    // Kiểm tra kết nối
    if (!socket.connected) {
      console.log('Socket is not connected');
      return;
    }

    const newMessage: ChatMessageType = {
      id: `${socket.id}-${Date.now()}`,
      username: currentUser,
      text,
      createdAt: new Date().toISOString(),
    };

    // Gửi tin nhắn đến server
    socket.emit(
      'send_message',
      newMessage,
    );

    // Xóa nội dung input
    setMessage('');
  };


  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>
              ‹
            </Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Group CSE 434
          </Text>
        </View>

        {/* Messages */}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              currentUser={currentUser}
            />
          )}
          contentContainerStyle={
            styles.messageList
          }
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({
              animated: true,
            })
          }
        />

        {/* Input */}

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
          >
            <Text style={styles.attachIcon}>
              📎
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Enter message..."
            placeholderTextColor="#777777"
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>
              ➤
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  backButton: {
    width: 30,
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 30,
    color: '#111111',
  },

  headerTitle: {
    fontSize: 16,
    color: '#111111',
    marginLeft: 5,
    fontWeight: '500',
  },

  messageList: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 20,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },

  attachButton: {
    width: 35,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  attachIcon: {
    fontSize: 20,
  },

  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F1F4F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111111',
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#20A590',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  sendIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },
});
