import { useState } from "react";
import { View, TextInput, Button, StyleSheet, TextInputSubmitEditingEventData, NativeSyntheticEvent } from "react-native";

interface MessageInputProps {
    onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage("");
        }
    };

    // 엔터(완료 버튼) 입력 처리
    const handleEnterPress = (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
        if (event.nativeEvent.text.trim()) {
            handleSend();
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="메시지를 입력하세요..."
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleEnterPress} // 엔터 입력 처리
                returnKeyType="send" // iOS에서 엔터 버튼을 "보내기"로 표시
                placeholderTextColor="white" // placeholder 색상 변경
            />
            <Button title="보내기" onPress={handleSend} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 8,
        marginRight: 10,
        borderRadius: 5,
        color: "white",
    },
});

export default MessageInput;
