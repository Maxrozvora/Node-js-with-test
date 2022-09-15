const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequalize = require('../src/config/database');

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

const postUser = async (user) => {
    return await request(app).post('/api/1.0/users').send(user);
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

    it('returns username cannot be null when username is null', async () => {
        const { body } = await postUser(invalidUser);
        expect(body.validationErrors.username).toBe("Username cannot be null");
    });

    it('returns email cannot be null when email is null', async () => {
        const { body } = await postUser({
            username: 'user1',
            email: null,
            password: 'P4ssword',
        });
        expect(body.validationErrors.email).toBe("Email cannot be null");
    });

    it('errors when username and email is null', async () => {
        const { body } = await postUser({
            username: null,
            email: null,
            password: 'P4ssword',
        });
        expect(Object.keys(body.validationErrors)).toEqual(["username", "email"]);
    });
})

