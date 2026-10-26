

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type ChatMessageType = {
  id: string;
  username: string;
  text: string;
  createdAt: string;
};

type Props = {
  message: ChatMessageType;
  currentUser: string;
};

export default function ChatBubble({
  message,
  currentUser,
}: Props) {
  const isOwnMessage =
    message.username === currentUser;

  const time = new Date(
    message.createdAt,
  ).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      style={[
        styles.wrapper,
        isOwnMessage
          ? styles.ownWrapper
          : styles.otherWrapper,
      ]}
    >
      {!isOwnMessage && (
        <Text style={styles.username}>
          {message.username}
        </Text>
      )}

      <View
        style={[
          styles.bubble,
          isOwnMessage
            ? styles.ownBubble
            : styles.otherBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isOwnMessage &&
            styles.ownMessageText,
          ]}
        >
          {message.text}
        </Text>
      </View>

      <Text style={styles.time}>
        {time}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: '85%',
    marginBottom: 12,
  },

  ownWrapper: {
    alignSelf: 'flex-end',
  },

  otherWrapper: {
    alignSelf: 'flex-start',
  },

  username: {
    fontSize: 13,
    fontWeight: '600',
    color: '#287C70',
    marginBottom: 4,
  },

  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

  ownBubble: {
    backgroundColor: '#287C70',
    borderBottomRightRadius: 3,
  },

  otherBubble: {
    backgroundColor: '#EFF4F5',
    borderBottomLeftRadius: 3,
  },

  messageText: {
    fontSize: 14,
    color: '#111111',
  },

  ownMessageText: {
    color: '#FFFFFF',
  },

  time: {
    fontSize: 10,
    color: '#888888',
    marginTop: 4,
    textAlign: 'right',
  },
});
