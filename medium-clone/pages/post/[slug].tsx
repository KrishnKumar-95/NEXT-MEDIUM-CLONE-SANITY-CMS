import Head from 'next/head'
import { GetStaticProps } from "next";
import Header from "../../Components/Header"
import {sanityClient,urlFor} from '../../sanity'
import { Post } from "../../typings";
import PortableText from 'react-portable-text'
import {useForm, SubmitHandler} from 'react-hook-form'
import { useState } from 'react';

interface IFormInput {
  _id: string,
  name: string,
  email: string,
  comment: string
}

interface Props{
  post: Post;
}

function Post({post}:Props) {

  const [submitted, setSubmitted] = useState(false)

  const {register, handleSubmit, formState: {errors}} = useForm<IFormInput>();

  const onSubmit:SubmitHandler<IFormInput> = (data)=>{
    fetch("/api/createComment",{
      method: "POST",
      body: JSON.stringify(data)
    }).then(()=>{
      console.log(data)
      setSubmitted(true)
    }).catch((err)=>{
      setSubmitted(false)
    })
  }

    return (
    <main>
      <Head>
        <title>Medium Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

          <Header/>

        <img className="w-full h-40 object-cover" src={urlFor(post.mainImage).url()} alt="banner" />

        <article className="max-w-3xl mx-auto p-5">
          <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
          <h2 className="text-xl font-light text-gray-500 md-2">{post.description}</h2>  
          <div className="flex items-center space-x-2">
            <img className="h-10 w-10 rounded-full " src={urlFor(post.author.image).url()} alt="author_image" />
            <p className="font-extralight text-sm">Blog post by <span className="text-green-600">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
          </div>

          <div className="mt-10 text-justify">
            <PortableText 
              className=""
              dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
              projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
              content={post.body}
              serializers={
                {
                  h1:(props: any)=>(<h1 className="text-2xl font-bold my-5" {...props}></h1>),
                  h2:(props: any)=>(<h2 className="text-xl font-bold my-5" {...props}></h2>),
                  li: ({children}: any)=>(<li className="ml-4 list-disc">{children}</li>)
                  ,
                  link: ({href, children}: any) => (<a href={href} className="text-blue-500 hover:underline">{children}</a>),
                }}
            />
            </div>
        </article>
        <hr className='max-w-lg my-5 mx-auto border border-yellow-500' />

        {submitted ? (<div className='flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto'>
          <h3 className='text-3xl font-bold'>Thank you for submitting your comment...</h3>
          <p>Once it has been approvred then it will appear below!</p>
        </div>) : (

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-5 max-w-2xl mx-auto mb-10'>
          
          <h3 className='text-sm text-yellow-500'>Enjoyed this article?</h3>
          <h4 className='text-3xl font-bold'>Leave a comment below !</h4>
          <hr className='py-3 mt-2' />

          <input 
            {...register("_id")}
            type="hidden"
            name='_id'
            value={post._id} />

          <label className='block mb-5'>
            <span className='text-gray-700'>Name : </span>
            <input {...register("name",{required: true})} className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 focus:ring outline-none' type="text" placeholder='Krishn Kumar' />
          </label>
          <label className='block mb-5'>
            <span className='text-gray-700'>Email : </span>
            <input {...register("email",{required: true})} className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 focus:ring outline-none' type="email" placeholder='email@example.com' />
          </label>
          <label className='block mb-5'>
            <span className='text-gray-700'>Comment : </span>
            <textarea {...register("comment",{required: true})} className='shadow border rounded py-2 px-3 outline-none form-textarea mt-1 block w-full ring-yellow-500 focus:ring' rows={8} placeholder='Enter Comment' />
          </label>

            <div className='flex flex-col py-5'>
              {errors.name && (<span className='text-red-500'>- The name field is required</span>)}
              {errors.email && (<span className='text-red-500'>- The email field is required</span>)}
              {errors.comment && (<span className='text-red-500'>- The comment field is required</span>)}
            </div>

            <input 
              type="submit" 
              className='
                shadow 
                bg-yellow-500 
                hover:bg-yellow-400 
                focus:shadow-outline 
                focus:outline-none 
                text-white 
                font-bold 
                py-2 
                px-4 
                rounded 
                cursor-pointer' 
            />

        </form>

        )}

        {/* Comments */}
        <div className='flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2'>
          <h3 className='text-4xl'>Comments</h3>
          <hr className='pb-2' />
          {post.comments.map((comment)=>(
            <div key={comment._id}>
              <p><span className='text-yellow-500'>{comment.name}</span> : {comment.comment}</p>
            </div>
          ))}
        </div>
    </main>
  )
}

export default Post;

// This will populate all the slugs from posts
export const getStaticPaths = async()=>{
    const query = `*[_type == "post"]{
        _id,
        slug{
            current
        }
    }`;

    const posts = await sanityClient.fetch(query);
    const paths = posts.map((post:Post)=>({
      params:{
        slug: post.slug.current,
      }
    }));
    return {
      paths,
      fallback: 'blocking'
    }
};

// This will return Props
export const getStaticProps : GetStaticProps = async({params})=>{
  // Querty which is going to be searched
  const query = `
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    _createdAt,
    title,
    author ->{
      name,
      image
    },
    'comments': *[_type == "comment" && post._ref == ^._id && approved == true],
    description,
    mainImage,
    slug,
    body
  }`

  // << params?.slug >> This is Optional Chaining here we are saying that if the value of params is present then execute << params.slug >> Otherwise stop working or return undefined
  const post = await sanityClient.fetch(query,{
    slug: params?.slug,
  })

  if(!post){
    return {
      notFound: true
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60, // This will update the old cache after 60 sec after that time client will feel a little bit delay because page will rebuild
  }  
}