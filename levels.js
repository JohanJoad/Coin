const LEVELS = [
           
    
    {id: 2,"map":[[1,1,1,1,1,1,1,1],[1,0,1,0,1,0,1,1],[1,0,1,0,1,0,1,1],[1,0,1,0,1,0,1,1],[1,0,0,0,0,0,1,1],[1,1,1,1,1,1,1,1]],"coins":[{"x":1,"y":1,"color":"red"},{"x":3,"y":1,"color":"red"},{"x":1,"y":3,"color":"blue"},{"x":3,"y":3,"color":"blue"},{"x":5,"y":1,"color":"red"},{"x":5,"y":3,"color":"blue"}],"targets":[{"x":1,"y":3,"color":"red"},{"x":3,"y":3,"color":"red"},{"x":1,"y":1,"color":"blue"},{"x":3,"y":1,"color":"blue"},{"x":5,"y":1,"color":"blue"},{"x":5,"y":3,"color":"red"}]}
    ,

    {id :3,"map":[[1,1,1,1,1,1,1,1],[1,0,1,0,1,0,0,1],[1,0,1,0,1,0,1,1],[1,0,1,0,1,0,0,1],[1,0,0,0,0,0,1,1],[1,1,1,1,1,1,1,1]],"coins":[{"x":1,"y":1,"color":"green"},{"x":3,"y":1,"color":"green"},{"x":1,"y":2,"color":"blue"},{"x":3,"y":2,"color":"blue"},{"x":1,"y":3,"color":"red"},{"x":3,"y":3,"color":"red"},{"x":5,"y":1,"color":"green"},{"x":5,"y":2,"color":"blue"},{"x":5,"y":3,"color":"red"}],"targets":[{"x":1,"y":1,"color":"red"},{"x":3,"y":1,"color":"red"},{"x":5,"y":1,"color":"red"},{"x":1,"y":3,"color":"blue"},{"x":3,"y":3,"color":"blue"},{"x":5,"y":3,"color":"blue"},{"x":1,"y":2,"color":"green"},{"x":3,"y":2,"color":"green"},{"x":5,"y":2,"color":"green"}]}
    , 
    
    {
        id: 1,
        map: [
            [1, 1, 1, 1, 1, 1, 1,],
            [1, 0, 1, 0, 1, 0, 1,],
            [1, 0, 0, 0, 0, 0, 1,],
            [1, 0, 1, 1, 1, 0, 1,],
            [1, 1, 1, 1, 1, 1, 1,]
            
        ],
        coins: [
            { x: 1, y: 1, color: 'blue' },
            { x: 1, y: 3, color: 'blue' },
            { x: 3, y: 1, color: 'blue' },

            { x: 1, y: 2, color: 'green' },
            { x: 5, y: 1, color: 'green' },
            { x: 5, y: 3, color: 'green' }
        ],
        targets: [
            { x: 1, y: 1, color: 'green' },
            { x: 1, y: 3, color: 'green' },
            { x: 3, y: 1, color: 'green' },

            { x: 1, y: 2, color: 'blue' },
            { x: 5, y: 1, color: 'blue' },
            { x: 5, y: 3, color: 'blue' }
        ]
    },

   
];