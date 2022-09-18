const { User, Thought } = require('../models');

const thoughtController = {
  //find thoughts
  getAllThoughts(req, res) {
    Thought.find({})
    .populate({
        path: 'reactions',
        select:'-__v'
    })
    .select('-__v')
    .sort({ _id: -1})
    .then((dbThoughtData) => {
        res.json(dbThoughtData)
    })
    .catch((err) => {
        console.log(err);
        res.status(400).json(err)
    })
}, 
  //get thought by id 
  getThoughtById ({ params }, res) {
    Thought.findOne({ _id: params.id })        .populate({
      path: 'reactions',
      select: '-__v'
  })
  .select('-__v')
  .then((dbThoughtData) => {
    if(!dbThoughtData){
        res.statue(404).json({message: 'no thought found with this id'});
    }
    res.json(dbThoughtData);
})
.catch((err)=> {
    console.log(err);
    res.status(400).json(err)
})
  },

//create thought
addThought({ params, body }, res) {
  Thought.create(body)
    .then(({ _id }) => {
      return User.findOneAndUpdate(
        { _id: params.userId },
        { $push: { thoughts: _id } },
        { new: true }
      );
    })
    .then(dbThought => {
      if (!dbThought) {
        res.status(404).json({ message: 'No user found with this id!' });
        return;
      }
      res.json(dbThought);
    })
    .catch(err => res.json(err));
},
//update thought
updateThought({ params, body }, res) {
  Thought.findOneAndUpdate({ _id: params.id }, body, {
    new: true,
    runValidators: true,
  })
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: 'No thought found with this id'});
        return;
      }
      res.json(dbThoughtData);
    })
    .catch((err)=> {
      console.log(err);
      res.status(400).json(err)
  })
},
//delete thought 
removeThought({ params }, res) {
  Thought.findOneAndDelete({_id: params.id})
  .then(dbThought => {
      if (!dbThought) {
          res.status(404).json({message: 'No thoughts with this particular ID!'});
          return;
      }
      res.json(dbThought);
      })
      .catch(err => res.status(400).json(err));
},
//create reaction
addReaction({ params, body }, res) {
  Thought.findOneAndUpdate(
    { _id: params.thoughtId },
    { $push: { reactions: body } },
    { new: true, runValidators: true }
  )
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "No thought with this id" });
        return;
      }
      res.json(dbThoughtData);
    })
    .catch((err) => res.json(err));
},
//delete reaction
removeReaction({ params }, res) {
  Thought.findOneAndUpdate({_id: params.thoughtId}, {$pull: {reactions: {reactionId: params.reactionId}}}, {new : true})
      .then(dbThought => {
          if (!dbThought) {
              res.status(404).json({message: 'No thoughts with this particular ID!'});
              return;
          }
          res.json(dbThought);
      })
      .catch(err => res.status(400).json(err));
}

}

module.exports = thoughtController;