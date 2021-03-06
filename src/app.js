App = {

    loading: false,

    contracts: {},

    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
          App.web3Provider = web3.currentProvider
          web3 = new Web3(web3.currentProvider)
        } else {
          window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
          window.web3 = new Web3(ethereum)
          try {
            // Request account access if needed
            await ethereum.enable()
            // Acccounts now exposed
            web3.eth.sendTransaction({/* ... */})
          } catch (error) {
            // User denied account access...
          }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
          App.web3Provider = web3.currentProvider
          window.web3 = new Web3(web3.currentProvider)
          // Acccounts always exposed
          web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        App.account = web3.eth.accounts[0];
        web3.eth.defaultAccount = App.account
        console.log(App.account)
        // if (App.contracts !== {}) {
        //     console.log(await App.contracts.todoList.taskCount())
        // }
    },

    loadContract: async () => {
        const todoList = await $.getJSON('TodoList.json');
        App.contracts.TodoList = TruffleContract(todoList);
        App.contracts.TodoList.setProvider(App.web3Provider);

        App.todoList = await App.contracts.TodoList.deployed()
        // console.log(App.todoList)
    },

    render: async () => {
        if ( App.loading ) {
            return
        }

        App.setLoading(true)

        await App.renderTasks()

        App.setLoading(false)
    },

    renderTasks: async () => {

        const taskCount = await App.todoList.taskCount();
        // console.log(taskCount)

        const $taskTemplate = $('.task-item')

        //start the taskcount from 1 
        for (let i = 1; i <= taskCount; i++) {

            const [ taskId, taskContent, taskCompleted ] = await App.todoList.tasks(i);
            taskIdInt = taskId.toNumber()

            // console.log(taskContent);
            const $newTaskTemplate = $taskTemplate.clone();
            $newTaskTemplate.find('.content').text(taskContent)
            $newTaskTemplate.find('input').prop('name', taskIdInt).prop('checked', taskCompleted)
                            .on('click', App.toggleCompleted);

            if (!taskCompleted) {
                $("#tasks-list").append($newTaskTemplate)
            } else {
                $("#completed").append($newTaskTemplate)
            }

            $newTaskTemplate.show();

        }
    },

    createTask: async () => {

        App.setLoading(true);

        const newtask = $("#taskValue").val();
        console.log(newtask)

        result =  await App.todoList.createTask(newtask);
        console.log(result);

        App.setLoading(false);

        window.location.reload();
    },

    toggleCompleted: async (event) => {
        App.setLoading(true);

        const taskId = event.target.name;
        await App.todoList.toggleCompleted(taskId);

        window.location.reload();
    },

    setLoading: (isLoading) => {
        App.loading = isLoading;
        const loader = $(".loader")
        const content = $('.content')

        if (isLoading) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    }

}



$(() => {
    $(window).on('load', () => {
        App.load()
    })
})
