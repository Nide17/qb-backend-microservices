import React from 'react'
import { Image, Text, View, Page, Document, StyleSheet } from '@react-pdf/renderer';
import '../../footer/footer.css'
import HeaderFooter from './HeaderFooter'

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#f6f6f5",
        padding: 20
    },
    reviewHeader: {
        width: "100%",
        padding: 15,
        display: "flex",
        justifyContent: "space-around",
        flexDirection: "row",
    },

    reviewHeaderImage: {
        backgroundColor: "#fff",
        height: 100,
        width: 100,
        padding: 5,
        margin: "auto 0",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: "10px",
    },
    reviewTitle: {
        textAlign: "center",
        textTransform: "uppercase",
        color: "#6c757d",
        margin: 10
    },
    reviewContainer: {
        backgroundColor: "#ffffff",
        padding: "20px",
        marginBottom: 5
    },
    questionText: {
        fontSize: 13,
        marginBottom: 10,
        fontWeight: "900"
    },
    reviewImage: {
        width: 100,
        margin: "10px 30px",
    }
})

const PdfDocument = ({ review }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <HeaderFooter styles={styles} />
                <View className='py-3 my-2 border rounded' style={{ backgroundColor: "khaki" }}>
                    <Text style={styles.reviewTitle}>{review.title}</Text>
                </View>
                {
                    review && review.questions && review.questions.map((question, index) => (
                        <View key={index} style={styles.reviewContainer}>
                            <Text style={styles.questionText}>
                                Q{index + 1}. {question.questionText}
                            </Text>

                            {/* Image */}
                            {question.question_image ?
                                <Image
                                    style={styles.reviewImage}
                                    src={{ uri: question.question_image, method: "GET", headers: { "Cache-Control": "no-cache" }, body: "" }}
                                /> : null}

                            {/* Options */}
                            {question.answerOptions && question.answerOptions.map((option, index) => {

                                let explanation = option.explanations ? option.explanations : null

                                {/* If there is a word in the explanation paragraph that starts with http, make it a link */ }
                                if (explanation) {
                                    let words = explanation.split(" ")
                                    explanation = words.map(word => {
                                        if (word.startsWith("http")) {
                                            return <a key={word} href={word} target="_blank" rel="noreferrer">{word} </a>
                                        }
                                        return word + " "
                                    })
                                }

                                return (
                                    <View key={index} style={{
                                        fontSize: 12,
                                        marginBottom: 12,
                                        color: option.isCorrect ? "green" : !option.isCorrect && option.choosen ? "red" : "#6c757d"
                                    }}>
                                        <Text>{index + 1}. {option.answerText}</Text>
                                        {explanation && <Text style={{ fontSize: "9px", marginTop: 6 }}>Explanation: {explanation}</Text>}
                                    </View>
                                )
                            })
                            }
                        </View>
                    ))
                }
                <HeaderFooter styles={styles} fromFooter={true} />
            </Page>
        </Document>
    )
}

export default PdfDocument