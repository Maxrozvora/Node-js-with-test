const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequalize = require('../src/config/database');

beforeAll(async () => {
    return await sequalize.sync();
});

beforeEach(async () => {
    return User.destroy({ truncate: true });
})

describe('User Registration', () => {
    const postValidUser = async () => {
        return await request(app).post('/api/1.0/users').send({
            username: 'user1',
            email: "user1@email.com",
            password: 'P4ssword',
        });
    };

    it('User 200 OK when sign up request is valid', async () => {
        const responce = await postValidUser();
        expect(responce.status).toBe(200);
    })
    
    it('It returns 200 OK when sign up request is valid', async () => {
        const response = await postValidUser();
        expect(response.body.message).toBe("User created");
    });

    it('It saves user to database', async () => {
        const response = await await postValidUser();
        const userList = await User.findAll();
        expect(userList.length).toBe(1);
    });

    it('It saves the username and email to database', async () => {
        const response = await postValidUser();
        const userList = await User.findAll();
        const user = userList[0];
        expect(user.username).toBe("user1");
        expect(user.email).toBe('user1@email.com')
    });

    it('hashes password in database', async () => {
        await postValidUser();
        const [ user ] = await User.findAll();
        expect(user.password).not.toBe("P4ssword");
    })
})

