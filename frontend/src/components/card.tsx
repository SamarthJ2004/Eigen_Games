interface CardProps {
  title: string;
}

const Card = ({ title }: CardProps) => {
  return (
    <div>
      <h2 className="text-black">{title}</h2>
    </div>
  );
};

export default Card;
