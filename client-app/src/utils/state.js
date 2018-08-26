import axios from 'axios';
export default {
    transactionId: '',

    recordTransaction: (params) => {
        const promise = new Promise((resolve, reject) => {
            axios.post('http://localhost:8000/add_product/', params)
                .then(response => {
                    const res = response.data;
                    if (res.error) {
                        reject(res.msg);
                    }
                    else {
                        resolve(res.msg);
                    }
                })
                .catch(error => {
                    reject(error);
                })
        });
        return promise;
    },

    transactionHistory: (id) => {
        console.log('>>>', id);
        const promise = new Promise((resolve, reject) => {
            axios.get('http://localhost:8000/get_product/'+ id)
                .then(response => {
                    const res = response.data;
                    console.log('>>>ree', res);
                    resolve(res);
                })
                .catch(error => {
                    reject(error);
                })
        })
        return promise;
    },

    changeOwner: (params) => {
        const promise = new Promise((resolve, reject) => {
            axios.post('http://localhost:8000/change_holder', params)
                .then(response => {
                    const res = response.data;
                    console.log('>>>ree', res);
                    resolve(res);
                })
                .catch(error => {
                    reject(error);
                })
        });
        return promise;
    }
}