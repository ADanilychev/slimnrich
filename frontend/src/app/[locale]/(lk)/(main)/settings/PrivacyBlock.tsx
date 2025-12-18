import { useTranslations } from 'next-intl';

import Button from '@/components/UI/Button/Button';

import { useRouter } from '@/i18n/routing';

const PrivacyBlock = () => {
    const t = useTranslations('PrivacyPage');
    const router = useRouter();

    return (
        <div className="rules-block">
            <div className="rules-block__text">
                <div className="rules-block__scroll document-plate">
                    <div className="text-block">
                        <h2 style={{ textAlign: 'center' }}>Slim and Rich Privacy Policy</h2>
                    </div>
                    <div className="text-block">
                        <small>
                            We understand that your personal information is important to you, and you trust us with it.
                            We aim to be clear about how we use and protect your data, how you can manage it, and how to
                            contact us if you have any questions or concerns. Your privacy is very important to us.
                        </small>

                        <small>
                            This Privacy Policy explains how we handle privacy across all our applications, software,
                            websites, APIs, products, and services (“Services”). We have made an effort to write this
                            Policy in simple English. In this document, you will find information about what data we
                            collect, how we use it, how you can control it, and your rights regarding your information.
                            If you have any questions about this Policy or your data, you can contact our Data
                            Protection Officer at <a href="mailto:76bavmin@gmail.com">76bavmin@gmail.com</a>.
                        </small>
                    </div>

                    <div className="text-block">
                        <h3>Our Services</h3>

                        <small>
                            Slim and Rich organizes and runs challenges focused on weight loss, step tracking, and
                            dieting. These challenges use methods like gamification, financial rewards, prizes, and
                            encouragement from peers to help you achieve your weight loss or fitness goals more
                            effectively. You can join these challenges through our websites and mobile apps. Our
                            programs offer opportunities to earn money for losing weight or improving your health.
                        </small>

                        <small>
                            We only collect the minimum amount of personal information necessary for participation and
                            provision of our Services, as explained below, and we take strong measures to protect your
                            data in accordance with GDPR requirements.
                        </small>

                        <small>
                            When you use our Services, we gather and generate the following types of information.
                        </small>

                        <small>
                            When creating an account, you provide the following information: gender, age, weight,
                            height, marital status.
                        </small>

                        <small>
                            When you join a competition, you may need to provide additional information, including your
                            name, date of birth, and country. To improve your experience or enable certain features, you
                            may also provide us with data about your diet, sleep, water consumption, and similar
                            information, etc. We process this data on the following legal bases:
                        </small>

                        <small>
                            Consent: for special categories of data (e.g., health-related information), which you can
                            withdraw at any time.
                        </small>

                        <small>Contract: to provide you with the Services you request.</small>

                        <small>
                            Legitimate Interests: to improve and personalize our Services, provided such interests are
                            not overridden by your rights and interests.
                        </small>

                        <small>
                            Slim and Rich does not collect or store your payment information directly. Payments are
                            processed by third-party providers compliant with industry standards.
                        </small>

                        <small>
                            Since Slim and Rich is a social experience, you can expand your account and provide
                            additional information such as a profile picture, goals related to a specific task, and
                            other similar information. You can also connect with friends who have already joined Slim
                            and Rich, or invite them by entering their nickname or through integrations with social
                            networks or your device's contact list. We do not store your contact list; it is used only
                            for the purpose of adding friends and is deleted immediately after use.
                        </small>

                        <small>
                            If you contact us or participate in a survey, contest, or promotion, we collect the
                            information you provide, such as your name, contact information, and message.
                        </small>
                    </div>

                    <div className="text-block">
                        <h3>Special Categories of Personal Data</h3>

                        <small>
                            To the extent that we collect medical or other special categories of personal data under the
                            GDPR, we request your explicit consent for processing. You may withdraw your consent at any
                            time via your account settings or by contacting us at{' '}
                            <a href="mailto:76bavmin@gmail.com">76bavmin@gmail.com</a>.
                        </small>

                        <h4>PAYMENT AND CARD INFORMATION </h4>

                        <small>
                            When making a payment using Slim and Rich, you can provide payment information such as your
                            payment card or other payment details. We use third-party payment services that meet the
                            requirements of the payment card industry and do not store your credit card information.
                        </small>

                        <h4>INFORMATION THAT WE ARE DEVELOPING </h4>

                        <small>
                            When you use our Services, we may develop and store certain information about you for your
                            benefit or to improve our Services. For example, we can use your weight and height to
                            calculate your BMI.
                        </small>

                        <h4>USE OF INFORMATION </h4>

                        <small>
                            Slim and Rich uses the information we collect and receive to administer and manage the
                            Services, as well as for the purposes described in this Privacy Policy. We may also use your
                            data for the following purposes:
                        </small>

                        <small>To provide and improve our Services</small>

                        <ul>
                            <li>To communicate with you about your account and our Services</li>
                            <li>To ensure the security and integrity of our Services</li>
                            <li>To comply with legal obligations</li>
                        </ul>

                        <small>
                            When you access or use our Services, we receive various types of usage data. This includes
                            information about your interaction with mobile apps and other aspects of the Services. For
                            example, when you view content or perform a search, install apps, create or log into your
                            account, sync your device with your account, or open or interact with the Slim and Rich app,
                            we receive and monitor this information.
                        </small>

                        <small>
                            We also collect information about the platforms, browsers, devices, and computers that you
                            use to access our Services, including browser type, city, region, country, language,
                            operating system, IP addresses, information about a fitness device or mobile device
                            (including device and application identifiers), and a web page. the page you are referring
                            to, the pages you have visited on our website. Services, and sometimes on third-party
                            services, and information about cookies.
                        </small>

                        <small>
                            We do not sell your personal data to third parties. We only share your data with trusted
                            service providers as necessary to operate the Services, and only under strict contractual
                            obligations.
                        </small>

                        <h4>COOKIES AND SIMILAR TECHNOLOGIES </h4>

                        <small>
                            We use cookies and similar technologies to enable core functionality and personalize your
                            experience. Where required by law, we will request your consent for the use of non-essential
                            cookies via a cookie banner. You can manage your cookie preferences at any time via our
                            cookie management tool or your browser settings. Most web browsers automatically accept
                            cookies, but you can usually change your browser settings to reject some or all cookies if
                            you wish. Slim and RIch strives to provide you with the ability to manage your privacy and
                            provide shared access. However, Slim and RIch does not recognize the "Do not track" signals
                            initiated by the browser and does not respond to them.
                        </small>

                        <small>
                            Not using cookies may make some functions of the Services unavailable to you. Slim and Rich
                            may also use your IP address to identify you, administer Services, and help diagnose
                            problems with Slim and Rich servers.
                        </small>

                        <h4>
                            <h4>COOKIES AND SIMILAR TECHNOLOGIES </h4>
                        </h4>

                        <small>
                            To the extent that the information we collect relates to medical data or other special
                            category of personal data subject to the General Data Protection Regulation of the European
                            Union (“GDPR”), we request your explicit consent to the processing of this data. We receive
                            this consent separately when you take actions leading to our receiving data, for example,
                            when you connect your device to your account, provide us with access to data about your
                            exercises or activities from another service. You can use your account settings and tools to
                            revoke your consent at any time, including by terminating use of a feature, terminating
                            access to third-party services, disconnecting your device's connection, or deleting your
                            data or account. If you need help changing, deleting, or retrieving your data, please just
                            contact (we will be happy to help): 76bavmin@gmail.com.
                        </small>
                    </div>

                    <div className="text-block">
                        <h3>USE OF INFORMATION</h3>

                        <h4>TO MANAGE SERVICES</h4>

                        <small>
                            Slim and Rich uses the information we collect and receive to administer and manage the
                            Services, as well as in accordance with other provisions of this Privacy Policy. For
                            example, we use your information to provide you with a weight loss chart that helps you
                            understand your progress. We provide you with a variety of statistics and can provide other
                            visual representations of your data for your convenience. We also use this information to
                            determine which goal you need to complete in each competition in order to win it, and to
                            determine later whether you have won or lost it. We will also use the information you
                            provide to pay you your prize.
                        </small>

                        <small>
                            Your information, including your profile, name, photos, friendships, the members you follow
                            and who follow you, the clubs you belong to, your actions, as well as the likes and comments
                            you leave and receive, will be published on Slim and Rich. Your comparative data (for
                            example, your place in the leaderboard), as well as the fact of your victory and information
                            about it can also be shown to other users. We will not publish your success story without
                            your permission. We also keep your weight and age a secret (although we may place you in a
                            group of people with a similar weight and/or age, but only these other group members will
                            know about your presence in such a group).{' '}
                        </small>

                        <small>
                            We may also use your information to make or accept payments and points, provide
                            Service-related support, protect and enforce our Terms of Service and Service Agreement, and
                            ensure security and communication with you. We do not sell your information to third
                            parties.
                        </small>

                        <h4>SOCIAL AND FUN</h4>

                        <small>
                            Slim and Rich is a social project, and we strive to make it more fun. Other people will see
                            what you decide to post or share (this is usually the whole point of posting and sharing
                            information). In addition, participants in your competitions will be able to see your name
                            and photo, as well as some confidential statistics such as, for example, your rating (if
                            applicable), percentage of weight loss and actual weight (if applicable). The people
                            participating in your contest will find out if you are the owner, but we will not publicly
                            post your success story without your permission.
                        </small>

                        <small>
                            We also use your information to analyze, develop, and improve our Services. To do this, Slim
                            and Rich can use third-party analytics providers to gain insight into how our Services are
                            used and help us improve the Services in strict accordance with this Policy. We may also use
                            your information to promote our services.
                        </small>

                        <small>
                            Slim and Rich may depersonalize or aggregate the content you provide in connection with the
                            Services in ways that do not personally identify you, for data collection and research
                            purposes. Examples of such aggregated information or statistics include information about
                            equipment, usage, demographics, and performance. Slim and Rich may use, sell, license, and
                            share this information with third parties for research, business, public, or other purposes.
                        </small>

                        <small>
                            We also use your information to contact you, to inform you about Services, to send you
                            marketing messages, or to inform you about new features or updates to our Terms of Service
                            and Subscription Agreement. We also use your information to respond to you when you contact
                            us. Slim and Rich will use your information to contact you, for example by sending you
                            notifications.
                        </small>

                        <h4>To Promote Safety & Security</h4>

                        <small>
                            We use the information we collect to promote the safety and security of the Services and
                            Slim and Rich, our users and participants, and other parties. For example, we may use the
                            information to authenticate users, facilitate secure payments, and protect against fraud and
                            abuse.
                        </small>

                        <h4>Legal & Collections Issues</h4>

                        <small>
                            We may use this information to respond to a legal request or claim, conduct inspections, and
                            ensure compliance with our terms, Service Agreements, and policies, including the collection
                            of obligations owed to us.
                        </small>

                        <small>
                            As for personal data subject to the GDPR, we rely on several legal grounds for their
                            processing. These include cases where you have given your consent, which you can revoke at
                            any time using your account settings or by contacting us; when processing is necessary to
                            fulfill or enforce a contract with you, such as Terms of Service or a Service Agreement; and
                            our legitimate business interests, such as improvement, personalization, as well as Service
                            development, marketing of new features or products that may be of interest, and ensuring
                            security, as described above.
                        </small>
                    </div>

                    <div className="text-block">
                        <h2>Share Information</h2>

                        <small>
                            We may share your information strictly in accordance with this Policy with third parties
                            that provide Slim and Rich services, such as support and improvement of Services, promotion
                            of Services, payment processing or order fulfillment. These service providers will only have
                            access to information necessary to perform these limited functions on our behalf and are
                            required to protect your information. We may also engage service providers to collect
                            information about your use of the Services over time on our behalf so that we or they can
                            promote Slim and Rich or display information that may be relevant to your interests on the
                            Services or other websites or services. Depending on your decisions and privacy settings,
                            your information and content may be publicly available. For example, Slim and Rich may allow
                            you to post your information publicly. If you decide to do this, this information will be
                            publicly available.
                        </small>

                        <h4>THIRD-PARTY API COMPANIES or other integrations </h4>

                        <small>
                            When you choose to use third-party applications, plug-ins, or websites that integrate with
                            the Services, they may receive your information and content, including your personal
                            information, photos, and activity data. The information collected by these third parties is
                            subject to their terms and policies. Slim and Rich is not responsible for the terms and
                            policies of third parties.
                        </small>

                        <h4>Affiliates and buyers of Our business or assets</h4>

                        <small>
                            We may share your information with affiliated companies under our overall control, who are
                            required to comply with the terms of this Privacy Policy regarding your information. If Slim
                            and Rich is involved in a business combination, securities offering, bankruptcy,
                            reorganization, dissolution, or other similar transaction, we may share or share your
                            information in connection with such transaction.
                        </small>

                        <h4>LEGAL REQUIREMENTS</h4>

                        <small>
                            We may store and share your information with third parties, including law enforcement
                            agencies, government agencies, or private plaintiffs, within or outside your country of
                            residence, if we determine that such disclosure is reasonably necessary to comply with the
                            law, including to comply with court orders, warrants, subpoenas, or other requirements. a
                            legal or regulatory process. We may also retain or disclose your information if we determine
                            that disclosure is reasonably necessary or appropriate to prevent death or serious injury to
                            a person, to address national security or other matters of public concern, to prevent or
                            detect violations of our Terms of Service or Service Agreement, and fraud or abuse of Slim
                            and Rich or its members, as well as to protect our business, our property, or other
                            legitimate rights, including by disclosing information to our legal counsel and other
                            consultants and third parties in connection with fraud investigations, foreclosures, or
                            actual or potential litigation.
                        </small>

                        <h4>DMCA Notices </h4>

                        <small>
                            We may share your information with third parties by forwarding notices under the Digital
                            Millennium Copyright Act (DMCA), which will be sent to us in the form in which they were
                            provided, without any deletion.
                        </small>

                        <h4>YOUR RIGHTS TO ACCESS AND CONTROL YOUR PERSONAL DATA</h4>

                        <small>
                            Our team will immediately assist you in accessing and controlling your personal data, as
                            described below, regardless of where you live.
                        </small>

                        <h4>Data access and export </h4>

                        <small>
                            By logging into your account, you can access your personal information, including a
                            dashboard with data on your weight and/or step. If you have any problems finding what you
                            need, please contact us and we will be happy to help you promptly.
                        </small>
                    </div>

                    <div className="text-block">
                        <h4>Editing and deleting data </h4>

                        <small>
                            You can change and delete many parts of your personal information in your personal account
                            and account settings. For example, you can edit or delete the profile data that you provide,
                            as well as delete weight records and social media posts that you have made. In the
                            application, you are given the option to "delete" the weighing results. As a result of the
                            deletion, the weighing results will be deleted from your dashboard, but the information will
                            not be deleted from our database. We store all the results of the weigh-in to ensure the
                            integrity of the competition. If you have any problems finding or editing what you need, or
                            if you want to delete your account, please contact us and we will be happy to help promptly.
                            If you decide to delete your account, please note that although most of your information
                            will be deleted within 30 days, deleting all of your information, such as data stored in our
                            backup systems, may take up to 90 days. This is due to the size and complexity of the
                            systems we use to store data. We may also retain data for legal reasons, to prevent damage,
                            collect debts, and enforce legal rights and obligations. Please also note that it may not be
                            possible to delete your account if you have a debt owed to us or from us to you, and you may
                            need to resolve this issue before we can delete your account.
                        </small>

                        <h4>Objection to the use of data </h4>

                        <small>
                            We provide you with account settings and tools to control the use of our data. For example,
                            using the notification settings, you can limit the number of notifications you receive from
                            us; and in your app settings, you can revoke access to third-party apps that you previously
                            connected to your Slim and Rich account. If you reside in a particular country, then under
                            certain circumstances you may object to our processing of your information based on our
                            legitimate interests, including as described in the section "How we use information". You
                            have every right to object to the use of your information for direct marketing purposes.
                            Please review your notification settings to manage our marketing messages about our
                            services. If you have any problems finding what you need, please contact us and we will be
                            happy to help you promptly.
                        </small>

                        <h4>Data usage restrictions </h4>

                        <small>
                            In addition to the various controls that we offer, if you reside in a particular country,
                            you may, under certain circumstances, restrict the processing of your data. Please note that
                            you can always delete your account at any time (according to the notes in the "Edit and
                            Delete Data" section above). If you need further assistance regarding your rights, please
                            contact our data protection specialist. 76bavmin@gmail.com and we will consider your request
                            in accordance with the current legislation. If you live in a particular country, you also
                            have the right to file a complaint with the local data protection authority.
                        </small>

                        <h4>Data storage</h4>

                        <small>
                            We keep your account information for as long as your account exists, as we need it to manage
                            your account. In some cases, when you provide us with information about a function of the
                            Services, we delete the data after it is no longer needed for that function. We store
                            information such as your exercise or activity data until you use your account settings or
                            tools to delete the data or your account, as we use this data to provide you with your
                            personal statistics and other aspects of the Services. We also store information about you
                            and your use of the Services for as long as it is necessary for our legitimate business
                            interests, for legal reasons and to prevent damage.
                        </small>

                        <h4>Analytical and advertising services provided by third parties </h4>

                        <small>
                            We work with partners who provide us with analytical and advertising services. This includes
                            helping us understand how users interact with the Services, serving ads on our behalf
                            online, and evaluating the effectiveness of those ads. These companies may use cookies and
                            similar technologies to collect information about your interaction with the Services and
                            other websites and applications.
                        </small>

                        <h4>Data security </h4>

                        <small>
                            We strive to ensure the security of your personal information. We use various security
                            technologies and procedures to help protect your personal information from unauthorized
                            access, use, and disclosure. We conduct periodic security checks with the assistance of a
                            third-party security company to ensure the safety of our work and compliance with industry
                            best practices. Although we strive to use reasonable measures to protect your information,
                            consistent with its confidentiality, we do not guarantee the security of the information you
                            share with us, and we are not responsible for the theft, destruction, loss, or unintentional
                            disclosure of your information or content. No system can be 100% secure. Each of our
                            employees and contractors must comply with this Privacy Policy. Any employee or contractor
                            who acts in violation of this Policy is subject to serious sanctions.
                        </small>

                        <h4>Disclaimer</h4>

                        <small>
                            Slim and Rich will make every effort to protect your personal information, however, it is
                            impossible to guarantee the absolute security of data transmission over the Internet, and
                            Slim and Rich cannot guarantee the security of any information that you transmit to Slim and
                            Rich. The transfer of personal information is at your own risk.
                        </small>

                        <h4>Data transmission </h4>

                        <small>
                            We operate internationally and share information with the United States for the purposes
                            described in this policy. We rely on a variety of legal grounds for the legitimate transfer
                            of personal data worldwide. They include your consent and the model terms of the contract
                            approved by the EU Commission, which require certain privacy and security measures. Slim and
                            Rich remains responsible for the personal information that we share with others who process
                            it on our behalf. Please note that in the countries where we operate, privacy and data
                            protection laws may differ from those of your country and potentially provide less
                            protection. You accept this risk when you create a Slim and RIch account and consent to the
                            transfer of data, regardless of which country you reside in. If you later wish to withdraw
                            your consent, you can delete your SLim and Rich account as described in the section "Your
                            rights to access and Control your personal data."
                        </small>

                        <h4>Policy Concerning Children</h4>

                        <small>
                            The confidentiality of children's data is important to us. Persons under the age of 18 or
                            any higher minimum age in the jurisdiction where they reside are not allowed to create
                            accounts or use Slim and Rich. If we become aware that we have collected personal
                            information about a child who has not reached the appropriate minimum age, we will take
                            steps to delete this information as soon as possible. Parents who believe that their child
                            has provided us with personal information and would like it to be deleted can contact us at
                            <a href="mailto:76bavmin@gmail.com">76bavmin@gmail.com</a>.
                        </small>

                        <h4>Changes To This Policy </h4>

                        <small>
                            We may update this privacy statement periodically. When we do, we will also change the date
                            at the top of the privacy statement. We will notify you of significant changes to this
                            privacy statement by posting a prominent notice on the Slim and Rich dashboard, or by
                            sending you a notification directly. We recommend that you review this Privacy Policy
                            periodically to be aware of how we help protect the personal information we collect. Your
                            continued use of Slim and Rich means your acceptance of this Privacy Policy and any updates.
                            Please note that this Privacy Policy and any decisions you make at Slim and Rich do not
                            necessarily apply to personal information that you may have provided to us in the context of
                            our other separately managed products or services. Finally, we would like to point out that
                            this policy is written in English. To the extent that the translated version contradicts the
                            English version, this English version is crucial (i.e. it is what matters). Unless otherwise
                            stated, this Privacy Policy does not apply to third-party products or services or to the
                            activities of companies that we do not own or control, including other companies that you
                            may interact with on or through the Services.
                        </small>

                        <h4>How You Can Reach Us</h4>

                        <small>
                            Slim and Rich services are provided worldwide. Our company Slim and Rich is the controller
                            of your personal data in accordance with EU data protection legislation. If you have any
                            questions or comments regarding this Privacy Policy or our actions in connection with it,
                            please contact us by email: <a href="mailto:76bavmin@gmail.com">76bavmin@gmail.com</a>.
                        </small>
                    </div>
                </div>
            </div>

            <Button variant={'stroke'} onClick={() => router.back()}>
                {t('Back')}
            </Button>
        </div>
    );
};

export default PrivacyBlock;
