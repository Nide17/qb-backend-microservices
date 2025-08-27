import React from 'react'
import { Text, View, Image, Link } from '@react-pdf/renderer'
import logo from '../../../images/resourceImg.jpg'
import instagram from '../../../images/instagram.jpg'
import facebook from '../../../images/facebook.jpg'
import linkedin from '../../../images/linkedin.jpg'
import twitter from '../../../images/twitter.jpg'
import whatsapp from '../../../images/whatsapp.jpg'

const HeaderFooter = ({ styles, fromFooter }) => {

    return (
        <View style={{ backgroundColor: "#157a6e", padding: "5px 10px" }}>
            <View style={styles.reviewHeader}>
                <Image src={logo} style={styles.reviewHeaderImage} />
                <View className="social-network social-circle" style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <Link src="https://api.whatsapp.com/send?phone=250780579067" style={{ color: "#fff", textDecoration: "none" }}>
                        <Image src={whatsapp} style={{ width: "24px", margin: "4px", borderRadius: '4px', border: '1px solid #157a6e' }} />
                    </Link>
                    <Link src="https://www.facebook.com/QuizblogRw/" style={{ color: "#fff", textDecoration: "none" }}>
                        <Image src={facebook} style={{ width: "24px", margin: "4px", borderRadius: '4px', border: '1px solid #157a6e' }} />
                    </Link>
                    <Link src="https://www.linkedin.com/company/quiz-blog/" style={{ color: "#fff", textDecoration: "none" }}>
                        <Image src={linkedin} style={{ width: "24px", margin: "4px", borderRadius: '4px', border: '1px solid #157a6e' }} />
                    </Link>
                    <Link src="https://www.instagram.com/quizblogrw/" style={{ color: "#fff", textDecoration: "none" }}>
                        <Image src={instagram} style={{ width: "24px", margin: "4px", borderRadius: '4px', border: '1px solid #157a6e' }} />
                    </Link>
                    <Link src="https://twitter.com/QuizblogRw" style={{ color: "#fff", textDecoration: "none" }}>
                        <Image src={twitter} style={{ width: "24px", margin: "4px", borderRadius: '4px', border: '1px solid #157a6e' }} />
                    </Link>
                </View>
                <View style={{ fontSize: '12px', display: 'flex', justifyContent: "flex-start", alignItems: 'flex-start' }}>
                    <Text style={{ textAlign: 'left', margin: '8px 0' }}>
                        <Text style={{ color: "#ffffff" }}>Website: </Text>
                        <Link src="https://www.quizblog.rw" style={{ color: "#ffc107", textDecoration: "none" }}>
                            www.quizblog.rw
                        </Link>
                    </Text>
                    <Text style={{ textAlign: 'left', margin: '8px 0' }}>
                        <Text style={{ color: "#ffffff" }}>Email: </Text>
                        <Link src="mailto:quizblog.rw@gmail.com" style={{ color: "#ffc107", textDecoration: "none" }}>
                            quizblog.rw@gmail.com
                        </Link>
                    </Text>
                    <Text style={{ textAlign: 'left', margin: '8px 0' }}>
                        <Text style={{ color: "#ffffff" }}>Phone: </Text>
                        <Link src="#" style={{ color: "#ffc107", textDecoration: "none" }}>
                            0780579067
                        </Link>
                    </Text>
                </View>
            </View>
            {fromFooter && (
                <View style={{ marginTop: 10, display: "block" }}>
                    <Text style={{ textAlign: "center", color: '#fff', fontSize: '.9rem', fontWeight: '500' }}>
                        &copy; Copyright {new Date().getFullYear()} - Quiz-Blog. All Rights Reserved.
                    </Text>
                </View>
            )}
        </View>
    )
}

export default HeaderFooter
