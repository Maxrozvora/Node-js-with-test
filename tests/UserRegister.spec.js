const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequalize = require('../src/config/database');
const EmailService = require('../src/email/emailService');

const nodemailerStub = require('nodemailer-stub');

beforeAll(async () => {
    return await sequalize.sync();
});

beforeEach(async () => {
    return User.destroy({ truncate: true });
});

const validUser = {
    username: 'user1',
    email: "user1@email.com",
    password: 'P4ssword',
}

const invalidUser = {
    username: null,
    email: "user1@email.com",
    password: 'P4ssword',
}

const postUser = async (user, { language } = {}) => {
    const agent = request(app).post('/api/1.0/users');
    if (language) {
        agent.set('Accept-Language', language);
    }
    return await agent.send(user);
};

describe('User Registration', () => {   

    it('User 200 OK when sign up request is valid', async () => {
        const responce = await postUser(validUser);
        expect(responce.status).toBe(200);
    })
    
    it('It returns 200 OK when sign up request is valid', async () => {
        const response = await postUser(validUser);
        expect(response.body.message).toBe("User created");
    });

    it('It saves user to database', async () => {
        const response = await await postUser(validUser);
        const userList = await User.findAll();
        expect(userList.length).toBe(1);
    });

    it('It saves the username and email to database', async () => {
        const response = await postUser(validUser);
        const userList = await User.findAll();
        const user = userList[0];
        expect(user.username).toBe("user1");
        expect(user.email).toBe('user1@email.com')
    });

    it('hashes password in database', async () => {
        await postUser(validUser);
        const [ user ] = await User.findAll();
        expect(user.password).not.toBe("P4ssword");
    });

    it('return 400 when username is null', async () => {
        const responce = await postUser(invalidUser);
        expect(responce.status).toBe(400);
    });

    it('return validation error when validation error', async () => {
        const { body } = await postUser(invalidUser);
        expect(body.validationErrors).not.toBeUndefined();
    });

    it('errors when username and email is null', async () => {
        const { body } = await postUser({
            username: null,
            email: null,
            password: 'P4ssword',
        });
        expect(Object.keys(body.validationErrors)).toEqual(["username", "email"]);
    });

    const usernameNull = 'Username cannot be null';
    const usernameSize = 'Username must be at least 4 characters long and at most 32 characters long';
    const emailNull = 'Email cannot be null';
    const passwordNull = 'Password cannot be null';
    const passwordLength = 'Password must be at least 6 characters long';
    const passwordPattern = 'Password must contain at least one uppercase letter and one number';
    const emailInUse = 'Email already in use';

    it.each`
    field         | value               | expectedMessage
    ${'username'} | ${null}             | ${usernameNull}
    ${'username'} | ${'usr'}            | ${usernameSize}
    ${'username'} | ${'a'.repeat(33)}   | ${usernameSize}
    ${'email'}    | ${null}             | ${emailNull}
    ${'password'} | ${null}             | ${passwordNull}
    ${'password'} | ${'pass'}           | ${passwordLength}
    ${'password'} | ${'alllovercase'}   | ${passwordPattern}
    ${'password'} | ${'ALLUPPERCASE'}   | ${passwordPattern}
    ${'password'} | ${'loverand231231'} | ${passwordPattern}
    ${'password'} | ${'UPPER2312313'}   | ${passwordPattern}
    ${'password'} | ${'123123123223'}   | ${passwordPattern}
    `('returns $expectedMessage when $field is $value', async ({field, value, expectedMessage}) => {
        const user = {
            username: 'user1',
            email: 'user1@email.com',
            password: 'P4ssword',
        };
        const responce = await postUser({ ...user, [field]: value });
        const { body } = responce;
        expect(body.validationErrors[field]).toBe(expectedMessage);
    });

    it('returns error when email is not unique', async () => {
        await User.create({ ...validUser });
        const responce = await postUser(validUser);
        const { body } = responce;
        expect(body.validationErrors.email).toBe(emailInUse);
    });

    it('create use inactive mode', async() => {
        await postUser(validUser);
        const [ user ] = await User.findAll();
        expect(user.inactive).toBe(true);
    })

    it('create use inactive mode even the request body contains false', async() => {
        await postUser({ ...validUser, inactive: false });
        const [ user ] = await User.findAll();
        expect(user.inactive).toBe(true);
    })

    it('create an activationToken for user', async() => {
        await postUser(validUser);
        const [ user ] = await User.findAll();
        expect(user.activationToken).toBeTruthy();
    })

    it('sends an account activation with activationToken', async () => {
        await postUser(validUser);
        const lastMail = nodemailerStub.interactsWithMail.lastMail();
        expect(lastMail.to[0]).toBe(validUser.email);
        const [ user ] = await User.findAll();
        expect(lastMail.content).toContain(user.activationToken);
    })

    it('return 502 Bad Gateway when email service is down', async () => {
        const mockSendAtivationEmail = await jest
            .spyOn(EmailService, 'sendActivationEmail')
            .mockRejectedValue({
                    message: 'Failed to deliver email'
                });
        const responce = await postUser(validUser);
        mockSendAtivationEmail.mockReset();
        expect(responce.status).toBe(502);
    })

    it('return Email failure message when email is fails', async () => {
        const mockSendAtivationEmail = jest
            .spyOn(EmailService, 'sendActivationEmail')
            .mockRejectedValue({
                message: 'Failed to deliver email'
            });
        const responce = await postUser(validUser);
        mockSendAtivationEmail.mockRestore();
        expect(responce.body.message).toBe('Failed to deliver email');
    })

    // it('does not save user to database when activation is fails', async () => {
    //     const mockSendAtivationEmail = jest
    //         .spyOn(EmailService, 'sendActivationEmail')
    //         .mockRejectedValue({
    //             message: 'Failed to deliver email'
    //         });
    //     await postUser(validUser);
    //     mockSendAtivationEmail.mockRestore();
    //     const users = await User.findAll();  
    //     expect(users.length).toBe(0);
    // })

});

describe('Internaliztion', () => {    
    const usernameNull = 'Імʼя користувача не може бути порожнім';
    const usernameSize = 'Імʼя користувача повинно бути не менше 4 символів та не більше 32 символів';
    const emailNull = 'Імейл не може бути порожнім';
    const passwordNull = 'Пароль не може бути порожнім';
    const passwordLength = 'Пароль повинен бути не менше 6 символів';
    const passwordPattern = 'Пароль повинен містити принаймні одну велику літеру та одну цифру';
    const emailInUse = 'Імейл вже використовується';
    const userCreated = 'Користувач створений';
    const emailFailure = 'Помилка відправки імейлу';

    it.each`
    field         | value               | expectedMessage
    ${'username'} | ${null}             | ${usernameNull}
    ${'username'} | ${'usr'}            | ${usernameSize}
    ${'username'} | ${'a'.repeat(33)}   | ${usernameSize}
    ${'email'}    | ${null}             | ${emailNull}
    ${'password'} | ${null}             | ${passwordNull}
    ${'password'} | ${'pass'}           | ${passwordLength}
    ${'password'} | ${'alllovercase'}   | ${passwordPattern}
    ${'password'} | ${'ALLUPPERCASE'}   | ${passwordPattern}
    ${'password'} | ${'loverand231231'} | ${passwordPattern}
    ${'password'} | ${'UPPER2312313'}   | ${passwordPattern}
    ${'password'} | ${'123123123223'}   | ${passwordPattern}
    `('returns $expectedMessage when $field is $value when language sets as Ukrainian', async ({field, value, expectedMessage}) => {
        const user = {
            username: 'user1',
            email: 'user1@email.com',
            password: 'P4ssword',
        };
        const responce = await postUser({ ...user, [field]: value }, { language: 'ua' });
        const { body } = responce;
        expect(body.validationErrors[field]).toBe(expectedMessage);
    });

    it('returns error when email is not unique when language sets as Ukrainian', async () => {
        await User.create({ ...validUser });
        const responce = await postUser(validUser, { language: 'ua' });
        const { body } = responce;
        expect(body.validationErrors.email).toBe(emailInUse);
    });

    it('It returns 200 OK when sign up request is valid', async () => {
        const response = await postUser(validUser, { language: 'ua' });
        expect(response.body.message).toBe(userCreated);
    });

    it('return Email failure message when email is fails and language is Ukrainian', async () => {
        const mockSendAtivationEmail = jest
            .spyOn(EmailService, 'sendActivationEmail')
            .mockRejectedValue({
                message: emailFailure
            });
        const responce = await postUser(validUser, { language: 'ua' });
        mockSendAtivationEmail.mockRestore();
        expect(responce.body.message).toBe(emailFailure);
    })
})

